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
import za.co.absa.hyperdrive.trigger.models.ComputeInstance
import za.co.absa.hyperdrive.trigger.models.enums.ComputeInstanceStatuses
import za.co.absa.hyperdrive.trigger.models.enums.ComputeInstanceStatuses.ComputeInstanceStatus

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

trait ComputeInstanceRepository extends Repository {
  def insertInstance()(implicit ec: ExecutionContext): Future[Long]

  def updatePing(id: Long)(implicit ec: ExecutionContext): Future[Int]

  def deactivateLaggingInstances(currentPing: LocalDateTime, lagTolerance: Duration)(implicit ec: ExecutionContext): Future[Int]

  def getDeactivatedInstances()(implicit ec: ExecutionContext): Future[Seq[ComputeInstance]]

  def getActiveInstances()(implicit ec: ExecutionContext): Future[Seq[ComputeInstance]]
}

@stereotype.Repository
class ComputeInstanceRepositoryImpl extends ComputeInstanceRepository {

  import profile.api._

  override def insertInstance()(implicit ec: ExecutionContext): Future[Long] = {
    db.run {
      val instance = ComputeInstance(status = ComputeInstanceStatuses.Active, lastPing = LocalDateTime.now())
      (for {
        instanceId <- computeInstanceTable returning computeInstanceTable.map(_.id) += instance
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
    computeInstanceTable.filter(_.id === id)
      .filter(_.status === LiteralColumn[ComputeInstanceStatus](ComputeInstanceStatuses.Active))
      .map(_.lastPing)
      .update(LocalDateTime.now())
  }

  override def deactivateLaggingInstances(currentPing: LocalDateTime, lagTolerance: Duration)(implicit ec: ExecutionContext): Future[Int] = db.run {
    computeInstanceTable.filter(i => i.lastPing < currentPing.minusSeconds(lagTolerance.getSeconds))
      .filter(_.status === LiteralColumn[ComputeInstanceStatus](ComputeInstanceStatuses.Active))
      .map(_.status)
      .update(ComputeInstanceStatuses.Deactivated)
  }

  override def getDeactivatedInstances()(implicit ec: ExecutionContext): Future[Seq[ComputeInstance]] = db.run {
    computeInstanceTable.filter(_.status === LiteralColumn[ComputeInstanceStatus](ComputeInstanceStatuses.Deactivated))
      .result
  }

  override def getActiveInstances()(implicit ec: ExecutionContext): Future[Seq[ComputeInstance]] = db.run {
    computeInstanceTable.filter(_.status === LiteralColumn[ComputeInstanceStatus](ComputeInstanceStatuses.Active))
      .result
  }
}