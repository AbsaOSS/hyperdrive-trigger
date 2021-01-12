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

import java.time.{Duration, LocalDateTime}

import org.springframework.stereotype
import za.co.absa.hyperdrive.trigger.models.SchedulerInstance
import za.co.absa.hyperdrive.trigger.models.enums.SchedulerInstanceStatuses
import za.co.absa.hyperdrive.trigger.models.enums.SchedulerInstanceStatuses.SchedulerInstanceStatus

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

trait SchedulerInstanceRepository extends Repository {
  def insertInstance()(implicit ec: ExecutionContext): Future[Long]

  def updatePing(id: Long)(implicit ec: ExecutionContext): Future[Int]

  def deactivateLaggingInstances(currentPing: LocalDateTime, lagTolerance: Duration)(implicit ec: ExecutionContext): Future[Int]

  def getDeactivatedInstances()(implicit ec: ExecutionContext): Future[Seq[SchedulerInstance]]

  def getActiveInstances()(implicit ec: ExecutionContext): Future[Seq[SchedulerInstance]]
}

@stereotype.Repository
class SchedulerInstanceRepositoryImpl extends SchedulerInstanceRepository {

  import profile.api._

  override def insertInstance()(implicit ec: ExecutionContext): Future[Long] = {
    db.run {
      val instance = SchedulerInstance(status = SchedulerInstanceStatuses.Active, lastPing = LocalDateTime.now())
      (for {
        instanceId <- schedulerInstanceTable returning schedulerInstanceTable.map(_.id) += instance
      } yield {
        instanceId
      }).transactionally.asTry.map {
        case Success(instanceId) => instanceId
        case Failure(ex) =>
          throw new IllegalStateException(s"Unexpected error occurred when inserting instance $instance", ex)
      }
    }
  }

  override def updatePing(id: Long)(implicit ec: ExecutionContext): Future[Int] = db.run {
    schedulerInstanceTable.filter(_.id === id)
      .filter(_.status === LiteralColumn[SchedulerInstanceStatus](SchedulerInstanceStatuses.Active))
      .map(_.lastPing)
      .update(LocalDateTime.now())
  }

  override def deactivateLaggingInstances(currentPing: LocalDateTime, lagTolerance: Duration)(implicit ec: ExecutionContext): Future[Int] = db.run {
    schedulerInstanceTable.filter(i => i.lastPing < currentPing.minusSeconds(lagTolerance.getSeconds))
      .filter(_.status === LiteralColumn[SchedulerInstanceStatus](SchedulerInstanceStatuses.Active))
      .map(_.status)
      .update(SchedulerInstanceStatuses.Deactivated)
  }

  override def getDeactivatedInstances()(implicit ec: ExecutionContext): Future[Seq[SchedulerInstance]] = db.run {
    schedulerInstanceTable.filter(_.status === LiteralColumn[SchedulerInstanceStatus](SchedulerInstanceStatuses.Deactivated))
      .result
  }

  override def getActiveInstances()(implicit ec: ExecutionContext): Future[Seq[SchedulerInstance]] = db.run {
    schedulerInstanceTable.filter(_.status === LiteralColumn[SchedulerInstanceStatus](SchedulerInstanceStatuses.Active))
      .result
  }
}