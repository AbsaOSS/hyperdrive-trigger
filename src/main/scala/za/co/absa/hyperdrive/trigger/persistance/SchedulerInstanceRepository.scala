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

import javax.inject.Inject
import scala.concurrent.{ExecutionContext, Future}

trait SchedulerInstanceRepository extends Repository {
  def insertInstance()(implicit ec: ExecutionContext): Future[Long]

  def updateHeartbeat(id: Long, newHeartbeat: LocalDateTime)(implicit ec: ExecutionContext): Future[Int]

  def deactivateLaggingInstances(instanceId: Long, currentHeartbeat: LocalDateTime, lagTolerance: Duration)(implicit ec: ExecutionContext): Future[Int]

  def getAllInstances()(implicit ec: ExecutionContext): Future[Seq[SchedulerInstance]]
}

@stereotype.Repository
class SchedulerInstanceRepositoryImpl @Inject()(val dbProvider: DatabaseProvider)
  extends SchedulerInstanceRepository {

  import api._

  override def insertInstance()(implicit ec: ExecutionContext): Future[Long] = {
    db.run {
      val instance = SchedulerInstance(status = SchedulerInstanceStatuses.Active, lastHeartbeat = LocalDateTime.now())
      (for {
        instanceId <- schedulerInstanceTable returning schedulerInstanceTable.map(_.id) += instance
      } yield {
        instanceId
      }).withErrorHandling(s"Unexpected error occurred when inserting instance $instance")
    }
  }

  override def updateHeartbeat(id: Long, newHeartbeat: LocalDateTime)(implicit ec: ExecutionContext): Future[Int] = db.run {
    schedulerInstanceTable.filter(_.id === id)
      .filter(_.status === LiteralColumn[SchedulerInstanceStatus](SchedulerInstanceStatuses.Active))
      .map(_.lastHeartbeat)
      .update(newHeartbeat)
      .withErrorHandling()
  }

  override def deactivateLaggingInstances(instanceId: Long, currentHeartbeat: LocalDateTime, lagTolerance: Duration)(implicit ec: ExecutionContext): Future[Int] = db.run {
    schedulerInstanceTable.filter(i => i.lastHeartbeat < currentHeartbeat.minusSeconds(lagTolerance.getSeconds))
      .filter(_.status === LiteralColumn[SchedulerInstanceStatus](SchedulerInstanceStatuses.Active))
      .filter(_.id =!= instanceId)
      .map(_.status)
      .update(SchedulerInstanceStatuses.Deactivated)
      .withErrorHandling()
  }

  override def getAllInstances()(implicit ec: ExecutionContext): Future[Seq[SchedulerInstance]] = db.run {
    schedulerInstanceTable.result.withErrorHandling()
  }
}
