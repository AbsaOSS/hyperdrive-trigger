/*
 * Copyright 2018-2019 ABSA Group Limited
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
import za.co.absa.hyperdrive.trigger.models.Sensor
import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes

import scala.concurrent.{ExecutionContext, Future}

trait SensorRepository extends Repository {
  def getNewActiveSensors(idsToFilter: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[Sensor]]
  def getInactiveSensors(ids: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[Long]]
  def getActiveTimeSensors()(implicit ec: ExecutionContext): Future[Seq[Sensor]]
}

@stereotype.Repository
class SensorRepositoryImpl extends SensorRepository {
  import profile.api._

  override def getNewActiveSensors(idsToFilter: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[Sensor]] = db.run {(
    for {
      sensor <- sensorTable if !(sensor.id inSet idsToFilter)
      workflow <- workflowTable if workflow.id === sensor.workflowId && workflow.isActive
    } yield {
      sensor
    }).result
  }

  override def getInactiveSensors(ids: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[Long]] = db.run {(
    for {
      sensor <- sensorTable if sensor.id inSet ids
      workflow <- workflowTable if workflow.id === sensor.workflowId && !workflow.isActive
    } yield {
      sensor.id
    }).result
  }

  override def getActiveTimeSensors()(implicit ec: ExecutionContext): Future[Seq[Sensor]] = db.run {(
    for {
      sensor <- sensorTable if sensor.sensorType === (SensorTypes.Time:SensorTypes.SensorType)
      workflow <- workflowTable if workflow.id === sensor.workflowId && workflow.isActive
    } yield {
      sensor
    }).result
  }
}
