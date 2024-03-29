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

package za.co.absa.hyperdrive.trigger.scheduler.cluster

import com.typesafe.scalalogging.LazyLogging

import java.time.Duration
import javax.inject.Inject
import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.models.SchedulerInstance
import za.co.absa.hyperdrive.trigger.persistance.SchedulerInstanceRepository

import scala.concurrent.{ExecutionContext, Future}

trait SchedulerInstanceService {

  def registerNewInstance()(implicit ec: ExecutionContext): Future[Long]

  def updateSchedulerStatus(instanceId: Long, lagThreshold: Duration)(
    implicit ec: ExecutionContext
  ): Future[Seq[SchedulerInstance]]
}

@Service
class SchedulerInstanceServiceImpl @Inject() (schedulerInstanceRepository: SchedulerInstanceRepository)
    extends SchedulerInstanceService
    with LazyLogging {

  override def registerNewInstance()(implicit ec: ExecutionContext): Future[Long] =
    schedulerInstanceRepository.insertInstance()

  override def updateSchedulerStatus(instanceId: Long, lagThreshold: Duration)(
    implicit ec: ExecutionContext
  ): Future[Seq[SchedulerInstance]] = {
    for {
      currentHeartbeat <- schedulerInstanceRepository.getCurrentDateTime()
      updatedCount <- schedulerInstanceRepository.updateHeartbeat(instanceId, currentHeartbeat)
      _ <-
        if (updatedCount == 0) {
          Future.failed(new SchedulerInstanceAlreadyDeactivatedException)
        } else {
          Future {}
        }
      deactivatedCount <- schedulerInstanceRepository.deactivateLaggingInstances(
        instanceId,
        currentHeartbeat,
        lagThreshold
      )
      _ = if (deactivatedCount != 0)
        logger.info(
          "Deactivated {} instances at current heartbeat {} by (SchedulerId={})",
          deactivatedCount,
          currentHeartbeat,
          instanceId
        )
      allInstances <- schedulerInstanceRepository.getAllInstances()
    } yield allInstances
  }
}
