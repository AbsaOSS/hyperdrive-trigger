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

package za.co.absa.hyperdrive.trigger.models.tables

import slick.lifted.AbstractTable
import za.co.absa.hyperdrive.trigger.models.{History, HistoryPair}

import scala.concurrent.ExecutionContext
import scala.reflect.runtime.{universe => ru}

trait HistoryTableQuery {
  this: Profile with JdbcTypeMapper =>

  import api._

  implicit class HistoryTableQueryExtension[T <: HistoryTable with AbstractTable[_]: ru.TypeTag](tableQuery: TableQuery[T]) {
    def getHistoryForEntity(entityId: Long)(implicit ec: ExecutionContext): DBIOAction[Seq[History], NoStream, Effect.Read] = {
      val queryResult = tableQuery
        .filter(_.entityId === entityId).map(
        row => (row.id, row.changedOn, row.changedBy, row.operation)
      ).result

      queryResult.map(
        _.map(result => History.tupled(result))
      )
    }

    def getEntitiesFromHistory(leftId: Long, rightId: Long)(implicit ec: ExecutionContext): DBIOAction[HistoryPair[T#TableElementType], NoStream, Effect.Read] = {
      val queryResult = tableQuery
        .join(tableQuery).on(_.id === leftId && _.id === rightId)
        .result

      queryResult.map(
        _.headOption.map{ tuple => HistoryPair[T#TableElementType](tuple._1, tuple._2)
        }.getOrElse(
          throw new Exception(s"Entities with #${leftId} or #${rightId} don't exist on ${ru.typeOf[T]}.")
        )
      )
    }
  }
}
