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
import za.co.absa.hyperdrive.trigger.models.{Sensor, SensorProperties}
import za.co.absa.hyperdrive.trigger.scheduler.utilities.SensorsConfig

import scala.concurrent.{ExecutionContext, Future}

trait SensorRepository extends Repository {
  def getNewActiveAssignedSensors(idsToFilter: Seq[Long], assignedWorkflowIds: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[Sensor[_ <: SensorProperties]]]
  def getInactiveSensors(ids: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[Long]]
  def getChangedSensors(originalSensorsPropertiesWithId: Seq[(Long, SensorProperties)])(implicit ec: ExecutionContext): Future[Seq[Sensor[_ <:SensorProperties]]]
}

@stereotype.Repository
class SensorRepositoryImpl extends SensorRepository {
  import api._

  override def getNewActiveAssignedSensors(idsToFilter: Seq[Long], assignedWorkflowIds: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[Sensor[_ <: SensorProperties]]] = db.run {(
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

  override def getChangedSensors(originalSensorsPropertiesWithId: Seq[(Long, SensorProperties)])(implicit ec: ExecutionContext): Future[Seq[Sensor[_ <: SensorProperties]]] = {
    Future.sequence(
      originalSensorsPropertiesWithId.grouped(SensorsConfig.getChangedSensorsChunkQuerySize).toSeq.map(group => getChangedSensorsInternal(group))
    ).map(_.flatten)
  }

  private def getChangedSensorsInternal(originalSensorsPropertiesWithId: Seq[(Long, SensorProperties)])(implicit ec: ExecutionContext): Future[Seq[Sensor[_ <:SensorProperties]]] = db.run {(
    for {
      sensor <- sensorTable if originalSensorsPropertiesWithId
        .map(originalSensor => sensorIsDifferent(sensor, originalSensor._1, originalSensor._2))
        .reduceLeftOption(_ || _)
        .getOrElse(false: Rep[Boolean])
    } yield {
      sensor
    }).result
  }

  private def sensorIsDifferent(sensor: SensorTable, sensorId: Long, originalSensorProperties: SensorProperties): Rep[Boolean] = {
    sensor.id === sensorId && sensor.properties =!= originalSensorProperties
  }
}
