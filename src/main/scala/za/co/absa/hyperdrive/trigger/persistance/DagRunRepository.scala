/*
 * Copyright 2018 ABSA Group Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package za.co.absa.hyperdrive.trigger.persistance

import org.springframework.stereotype
import slick.ast.BaseTypedType
import slick.jdbc.SetParameter.{SetBoolean, SetInt, SetLong, SetString, SetTimestamp, SetUnit}
import slick.jdbc.{GetResult, PositionedParameters, SQLActionBuilder, SetParameter}
import za.co.absa.hyperdrive.trigger.models.dagRuns.DagRun
import za.co.absa.hyperdrive.trigger.models.search.{
  BooleanFilterAttributes,
  ContainsFilterAttributes,
  DateTimeRangeFilterAttributes,
  EqualsMultipleFilterAttributes,
  IntRangeFilterAttributes,
  LongFilterAttributes,
  SortAttributes,
  TableSearchRequest,
  TableSearchResponse
}

import java.sql.Timestamp
import javax.inject.Inject
import scala.concurrent.{ExecutionContext, Future}

trait DagRunRepository extends Repository {
  def searchDagRuns(searchRequest: TableSearchRequest)(implicit
    ec: ExecutionContext
  ): Future[TableSearchResponse[DagRun]]
}

@stereotype.Repository
class DagRunRepositoryImpl @Inject() (val dbProvider: DatabaseProvider) extends DagRunRepository {
  import api._
  private val fieldMapping = Map(
    "workflowId" -> "workflow.id",
    "workflowName" -> "workflow.name",
    "projectName" -> "workflow.project",
    "started" -> "dag_instance.started",
    "finished" -> "dag_instance.finished",
    "status" -> "dag_instance.status",
    "triggeredBy" -> "dag_instance.triggered_by",
    "id" -> "dag_instance.id"
  )

  private def orderByMapping(index: Int) = if (index == -1) "DESC" else "ASC"

  override def searchDagRuns(
    searchRequest: TableSearchRequest
  )(implicit ec: ExecutionContext): Future[TableSearchResponse[DagRun]] = {

    val dagIdsQueryMain =
      sql"""
        FROM dag_instance
        JOIN workflow on dag_instance.workflow_id = workflow.id
        WHERE 1=1
        """
    val queryFilters = generateQueryFilters(searchRequest)
    val dagIdsQueryFilters = queryFilters._1
    val setParameters = queryFilters._2

    val queryOrderBy = searchRequest.sort match {
      case Some(SortAttributes(by, order)) =>
        sql"""
          ORDER BY #${fieldMapping(by)} #${orderByMapping(order)}, dag_instance.id DESC
          """
      case None =>
        sql"""
          ORDER BY dag_instance.id DESC
          """
    }
    val dagIdsQueryLimitOffset =
      sql"""
        LIMIT #${searchRequest.size} OFFSET #${searchRequest.from}
        """
    val dagIdsQueryOpeningPart =
      sql"""
        WITH dag_ids AS (
        SELECT dag_instance.id
        """
    val dagIdsQueryClosingPart =
      sql"""
        )
        """
    val countQuerySelect =
      sql"""
        SELECT COUNT(1)
        """
    val dagRunQueryMain =
      sql"""
          select workflow.id,
               workflow.name,
               workflow.project,
               COALESCE(jobInstanceCount.count, 0) AS "job_count",
               dag_instance.started,
               dag_instance.finished,
               dag_instance.status,
               dag_instance.triggered_by,
               dag_instance.id
          from dag_instance
          left join (
            select job_instance.dag_instance_id, count(1) as "count"
            from job_instance
            join dag_ids on dag_ids.id = job_instance.dag_instance_id
            group by dag_instance_id
          ) as jobInstanceCount
              on jobInstanceCount.dag_instance_id = dag_instance.id
          left join workflow
              on workflow.id = dag_instance.workflow_id
          join dag_ids on dag_ids.id = dag_instance.id
        """

    val countQuery =
      SQLActionBuilder(concatQueryParts(countQuerySelect, dagIdsQueryMain, dagIdsQueryFilters), setParameters)
    val countQueryAction = countQuery.as[Int].head

    implicit val getDagRunResult: GetResult[DagRun] = GetResult(r =>
      DagRun(
        r.nextLong(),
        r.nextString(),
        r.nextString(),
        r.nextInt(),
        r.nextTimestamp().toLocalDateTime,
        r.nextTimestampOption().map(_.toLocalDateTime),
        r.nextString(),
        r.nextString(),
        r.nextLong()
      )
    )
    val dagRunsQuery = SQLActionBuilder(
      concatQueryParts(
        dagIdsQueryOpeningPart,
        dagIdsQueryMain,
        dagIdsQueryFilters,
        queryOrderBy,
        dagIdsQueryLimitOffset,
        dagIdsQueryClosingPart,
        dagRunQueryMain,
        queryOrderBy
      ),
      setParameters
    )
    val dagRunsQueryAction = dagRunsQuery.as[DagRun]

    db.run((for {
      l <- countQueryAction
      r <- dagRunsQueryAction
    } yield {
      TableSearchResponse[DagRun](items = r, total = l)
    }).withErrorHandling())
  }

  private def concatQueryParts(sqlActionBuilders: SQLActionBuilder*): Seq[Any] =
    sqlActionBuilders.map(_.queryParts).reduceOption(_ ++ _).getOrElse(Seq())

  private def generateQueryFilters(request: TableSearchRequest) = {
    val filters =
      applyContainsFilter(request.getContainsFilterAttributes) ++
        applyIntRangeFilter(request.getIntRangeFilterAttributes) ++
        applyDateTimeRangeFilter(request.getDateTimeRangeFilterAttributes) ++
        applyEqualsMultipleFilter(request.getEqualsMultipleFilterAttributes) ++
        applyLongFilter(request.getLongFilterAttributes) ++
        applyBooleanFilter(request.getBooleanFilterAttributes)
    val queryPart = concatQueryParts(filters.map(_._1): _*)
    val setParameterFns = filters.flatMap(_._2)
    val setParameter = SetParameter((_: Unit, pp: PositionedParameters) => setParameterFns.foreach(fn => fn(pp)))
    (SQLActionBuilder(queryPart, SetUnit), setParameter)
  }

  private def applyContainsFilter(attributes: Seq[ContainsFilterAttributes]) =
    attributes
      .filter(attribute => fieldMapping.contains(attribute.field))
      .map(attribute =>
        (
          sql"""AND #${fieldMapping(attribute.field)} LIKE '%' || ? || '%'""",
          Seq((pp: PositionedParameters) => SetString(attribute.value, pp))
        )
      )

  private def applyIntRangeFilter(attributes: Seq[IntRangeFilterAttributes]) = {
    val setIntParameter = (v: Int, pp: PositionedParameters) => SetInt(v, pp)
    attributes
      .filter(attribute => fieldMapping.contains(attribute.field))
      .map(attribute => applyRangeFilter(attribute.field, attribute.start, attribute.end, setIntParameter))
  }

  private def applyDateTimeRangeFilter(attributes: Seq[DateTimeRangeFilterAttributes]) = {
    val setTimestampParameter = (v: Timestamp, pp: PositionedParameters) => SetTimestamp(v, pp)
    attributes
      .filter(attribute => fieldMapping.contains(attribute.field))
      .map(attribute =>
        applyRangeFilter(
          attribute.field,
          attribute.start.map(Timestamp.valueOf),
          attribute.end.map(Timestamp.valueOf),
          setTimestampParameter
        )
      )
  }

  private def applyEqualsMultipleFilter(attributes: Seq[EqualsMultipleFilterAttributes]) =
    attributes
      .filter(attribute => fieldMapping.contains(attribute.field))
      .map { attribute =>
        val placeholders = List.fill(attribute.values.size)("?").mkString("(", ",", ")")
        (
          sql"""AND #${fieldMapping(attribute.field)} IN #${placeholders}""",
          attribute.values.map(value => (pp: PositionedParameters) => SetString(value, pp))
        )
      }

  private def applyLongFilter(attributes: Seq[LongFilterAttributes]) =
    attributes
      .filter(attribute => fieldMapping.contains(attribute.field))
      .map(attribute =>
        (
          sql"""AND #${fieldMapping(attribute.field)} = ?""",
          Seq((pp: PositionedParameters) => SetLong(attribute.value, pp))
        )
      )

  private def applyBooleanFilter(attributes: Seq[BooleanFilterAttributes]) =
    attributes
      .filter(attribute => fieldMapping.contains(attribute.field))
      .filter(attribute => attribute.value.isTrue != attribute.value.isFalse)
      .map(attribute =>
        (
          sql"""AND #${fieldMapping(attribute.field)} = ?""",
          Seq((pp: PositionedParameters) => SetBoolean(attribute.value.isTrue, pp))
        )
      )

  private def applyRangeFilter[B: BaseTypedType](
    field: String,
    start: Option[B],
    end: Option[B],
    setParameterFn: (B, PositionedParameters) => Unit
  ) =
    if (start.isDefined && end.isDefined) {
      (
        sql"""AND #${fieldMapping(field)} >= ?
              AND #${fieldMapping(field)} <= ?""",
        Seq(
          (pp: PositionedParameters) => setParameterFn(start.get, pp),
          (pp: PositionedParameters) => setParameterFn(end.get, pp)
        )
      )
    } else if (start.isDefined) {
      (sql"""AND #${fieldMapping(field)} >= ?""", Seq((pp: PositionedParameters) => setParameterFn(start.get, pp)))
    } else if (end.isDefined) {
      (sql"""AND #${fieldMapping(field)} <= ?""", Seq((pp: PositionedParameters) => setParameterFn(end.get, pp)))
    } else {
      (sql"""AND 1=1""", Seq())
    }
}
