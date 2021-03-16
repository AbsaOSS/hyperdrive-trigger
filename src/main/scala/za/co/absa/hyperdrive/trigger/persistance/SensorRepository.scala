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

import java.time.LocalDateTime

import org.springframework.stereotype
import za.co.absa.hyperdrive.trigger.models.SensorWithUpdated

import scala.concurrent.{ExecutionContext, Future}

trait SensorRepository extends Repository {
  def getNewActiveAssignedSensors(idsToFilter: Seq[Long], assignedWorkflowIds: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[SensorWithUpdated]]
  def getInactiveSensors(ids: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[Long]]
  def getChangedSensors(originalSensors: Seq[SensorWithUpdated])(implicit ec: ExecutionContext): Future[Seq[SensorWithUpdated]]
  def getChangedSensorsV2(originalSensors: Seq[SensorWithUpdated])(implicit ec: ExecutionContext): Future[Seq[SensorWithUpdated]]

}

@stereotype.Repository
class SensorRepositoryImpl extends SensorRepository {
  import profile.api._

  override def getNewActiveAssignedSensors(idsToFilter: Seq[Long], assignedWorkflowIds: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[SensorWithUpdated]] = db.run {(
    for {
      sensor <- sensorTable if !(sensor.id inSet idsToFilter)
      workflow <- workflowTable if(workflow.id === sensor.workflowId
        && workflow.isActive
        && (workflow.id inSetBind assignedWorkflowIds))
    } yield {
      (sensor, workflow.updated)
    }).result
  }.map(_.map(result => SensorWithUpdated(result._1, result._2)))

  override def getInactiveSensors(ids: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[Long]] = db.run {(
    for {
      sensor <- sensorTable if sensor.id inSet ids
      workflow <- workflowTable if workflow.id === sensor.workflowId && !workflow.isActive
    } yield {
      sensor.id
    }).result
  }

  override def getChangedSensors(originalSensors: Seq[SensorWithUpdated])(implicit ec: ExecutionContext): Future[Seq[SensorWithUpdated]] = {
    val sensorIds = originalSensors.map(_.sensor.id)
    db.run {(
        for {
          sensor <- sensorTable if sensor.id inSet sensorIds
          workflow <- workflowTable if workflow.id === sensor.workflowId && workflow.isActive && originalSensors
            .map(originalSensor => workflowIsUpdated(workflow, originalSensor))
            .reduceLeftOption(_ || _)
            .getOrElse(false: Rep[Boolean])
        } yield {
          (sensor, workflow.updated)
        }).result
    }.map(_.map(result => SensorWithUpdated(result._1, result._2)))
  }

 override def getChangedSensorsV2(originalSensors: Seq[SensorWithUpdated])(implicit ec: ExecutionContext): Future[Seq[SensorWithUpdated]] = {
    val start = LocalDateTime.MIN
    val ppp = DBIO.sequence(originalSensors.map { sensorWithUpdated =>
      val xxx = (for {
        sensor <- sensorTable if sensor.id === sensorWithUpdated.sensor.id
        workflow <- workflowTable if workflow.id === sensor.workflowId && workflow.isActive && workflow.updated.getOrElse(start) =!= sensorWithUpdated.updated.getOrElse(start)
      } yield {
        (sensor, workflow.updated)
      })
      val zzz = xxx.result.headOption.map(_.map(asd => SensorWithUpdated(asd._1, asd._2)))
      zzz
    })
    val result = ppp.map(xxxxx => xxxxx.flatten)
    db.run(result)
  }

  private def workflowIsUpdated(workflow: WorkflowTable, sensorWithUpdate: SensorWithUpdated): Rep[Boolean] = {
    val start = LocalDateTime.MIN
    workflow.id === sensorWithUpdate.sensor.workflowId && (workflow.updated.getOrElse(start) =!= sensorWithUpdate.updated.getOrElse(start))
  }
}
