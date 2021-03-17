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
import za.co.absa.hyperdrive.trigger.models.Sensor
import za.co.absa.hyperdrive.trigger.scheduler.utilities.SensorsConfig

import scala.concurrent.{ExecutionContext, Future}

trait SensorRepository extends Repository {
  def getNewActiveAssignedSensors(idsToFilter: Seq[Long], assignedWorkflowIds: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[Sensor]]
  def getInactiveSensors(ids: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[Long]]
  def getChangedSensors(originalSensors: Seq[Sensor])(implicit ec: ExecutionContext): Future[Seq[Sensor]]
}

@stereotype.Repository
class SensorRepositoryImpl extends SensorRepository {
  import profile.api._

  override def getNewActiveAssignedSensors(idsToFilter: Seq[Long], assignedWorkflowIds: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[Sensor]] = db.run {(
    for {
      sensor <- sensorTable if !(sensor.id inSet idsToFilter)
      workflow <- workflowTable if(workflow.id === sensor.workflowId
        && workflow.isActive
        && (workflow.id inSetBind assignedWorkflowIds))
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

  override def getChangedSensors(originalSensors: Seq[Sensor])(implicit ec: ExecutionContext): Future[Seq[Sensor]] = {
    Future.sequence(
      originalSensors.grouped(SensorsConfig.getChangedSensorsChunkQuerySize).toSeq.map(group => getChangedSensorsInternal(group))
    ).map(_.flatten)
  }

  private def getChangedSensorsInternal(originalSensors: Seq[Sensor])(implicit ec: ExecutionContext): Future[Seq[Sensor]] = db.run {(
    for {
      sensor <- sensorTable if originalSensors
        .map(originalSensor => sensorIsDifferent(sensor, originalSensor))
        .reduceLeftOption(_ || _)
        .getOrElse(false: Rep[Boolean])
    } yield {
      sensor
    }).result
  }

  private def sensorIsDifferent(sensor: SensorTable, originalSensor: Sensor): Rep[Boolean] = {
    sensor.id === originalSensor.id &&
      (sensor.sensorType =!= originalSensor.sensorType ||
      sensor.variables =!= originalSensor.properties.settings.variables ||
      sensor.maps =!= originalSensor.properties.settings.maps ||
      sensor.matchProperties =!= originalSensor.properties.matchProperties)
  }
}
