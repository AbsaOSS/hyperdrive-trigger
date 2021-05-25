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
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses
import za.co.absa.hyperdrive.trigger.models.{DagInstance, DagInstanceJoined, Event}

import scala.concurrent.{ExecutionContext, Future}

trait DagInstanceRepository extends Repository {
  def insertJoinedDagInstancesWithEvents(dagInstancesJoined: Seq[(DagInstanceJoined, Event)])(implicit executionContext: ExecutionContext): Future[Unit]

  def insertJoinedDagInstances(dagInstancesJoined: Seq[DagInstanceJoined])(implicit executionContext: ExecutionContext): Future[Unit]

  def insertJoinedDagInstance(dagInstanceJoined: DagInstanceJoined)(implicit executionContext: ExecutionContext): Future[Unit]

  def getDagsToRun(runningIds: Seq[Long], size: Int, assignedWorkflowIds: Seq[Long])(implicit executionContext: ExecutionContext): Future[Seq[DagInstance]]

  def update(dagInstance: DagInstance): Future[Unit]

  def hasRunningDagInstance(workflowId: Long)(implicit executionContext: ExecutionContext): Future[Boolean]

  def hasInQueueDagInstance(workflowId: Long)(implicit executionContext: ExecutionContext): Future[Boolean]
}

@stereotype.Repository
class DagInstanceRepositoryImpl extends DagInstanceRepository {
  import api._

  override def insertJoinedDagInstancesWithEvents(dagInstancesJoined: Seq[(DagInstanceJoined, Event)])(implicit executionContext: ExecutionContext): Future[Unit] = db.run(
    DBIO.sequence {
      dagInstancesJoined.map { dagInstanceJoined =>
        for {
          di <- dagInstanceTable returning dagInstanceTable.map(_.id) += dagInstanceJoined._1.toDagInstance
          e <- eventTable += dagInstanceJoined._2.copy(dagInstanceId = Option(di))
          jis <- jobInstanceTable ++= dagInstanceJoined._1.jobInstances.map(_.copy(dagInstanceId = di))
        } yield ()
      }
    }.transactionally
  ).map(_ => (): Unit)

  override def insertJoinedDagInstances(dagInstancesJoined: Seq[DagInstanceJoined])(implicit executionContext: ExecutionContext): Future[Unit] = db.run(
    DBIO.sequence {
      dagInstancesJoined.map(dagInstanceJoined => insertJoinedDagInstanceInternal(dagInstanceJoined))
    }.transactionally
  ).map(_ => (): Unit)

  override def insertJoinedDagInstance(dagInstanceJoined: DagInstanceJoined)(implicit executionContext: ExecutionContext): Future[Unit] = db.run(
    insertJoinedDagInstanceInternal(dagInstanceJoined).transactionally
  ).map(_ => (): Unit)

  private def insertJoinedDagInstanceInternal(dagInstanceJoined: DagInstanceJoined)(implicit executionContext: ExecutionContext): DBIOAction[Unit, NoStream, Effect.Write] = {
    for {
      di <- dagInstanceTable returning dagInstanceTable.map(_.id) += dagInstanceJoined.toDagInstance
      jis <- jobInstanceTable ++= dagInstanceJoined.jobInstances.map(_.copy(dagInstanceId = di))
    } yield ()
  }

  def getDagsToRun(runningIds: Seq[Long], size: Int, assignedWorkflowIds: Seq[Long])(implicit executionContext: ExecutionContext): Future[Seq[DagInstance]] = {
    val prefilteredResult = db.run(
      dagInstanceTable.filter { di =>
        !di.workflowId.in(
          dagInstanceTable.filter(_.id.inSet(runningIds)).map(_.workflowId)
        )
      }
        .filter(_.status.inSet(DagInstanceStatuses.nonFinalStatuses))
        .filter(_.workflowId inSetBind assignedWorkflowIds)
        .result
    )

    prefilteredResult.map(di =>
      di.groupBy(_.workflowId).flatMap(_._2.sortBy(_.id).take(1)).take(size).toSeq
    )
  }

  override def update(dagInstance: DagInstance): Future[Unit] = db.run(
    dagInstanceTable.filter(_.id === dagInstance.id).update(dagInstance).andThen(DBIO.successful((): Unit))
  )

  override def hasRunningDagInstance(workflowId: Long)(implicit executionContext: ExecutionContext): Future[Boolean] = {
    db.run(
      dagInstanceTable.filter(
        dagInstance =>
          dagInstance.workflowId === workflowId && dagInstance.status.inSet(DagInstanceStatuses.nonFinalStatuses)
      ).exists.result
    )
  }

  override def hasInQueueDagInstance(workflowId: Long)(implicit executionContext: ExecutionContext): Future[Boolean] = {
    db.run(
      dagInstanceTable.filter(dagInstance =>
        dagInstance.workflowId === workflowId && dagInstance.status.inSetBind(Set(DagInstanceStatuses.InQueue))
      ).exists.result
    )
  }

}
