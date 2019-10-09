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

package za.co.absa.hyperdrive.trigger

import za.co.absa.hyperdrive.trigger.persistance._
import za.co.absa.hyperdrive.trigger.scheduler.JobScheduler
import za.co.absa.hyperdrive.trigger.scheduler.eventProcessor.EventProcessor
import za.co.absa.hyperdrive.trigger.scheduler.executors.Executors
import za.co.absa.hyperdrive.trigger.scheduler.sensors.Sensors

import scala.concurrent.Future

object HyperDriverManager {

  var jobScheduler: JobScheduler = initialize()

  def isManagerRunning: Boolean = {
    this.jobScheduler.isManagerRunning
  }

  def startManager: Unit = {
    this.jobScheduler.startManager()
  }

  def stopManager: Future[Unit] = {
    this.jobScheduler.stopManager()
  }

  private def initialize(): JobScheduler = {
    new JobScheduler(
      sensors = new Sensors(
        eventProcessor = new EventProcessor(
          eventRepository = new EventRepositoryImpl(),
          dagDefinitionRepository = new DagDefinitionRepositoryImpl(),
          dagInstanceRepository = new DagInstanceRepositoryImpl()
        ),
        sensorRepository = new SensorRepositoryImpl()
      ),
      executors = new Executors(
        dagInstanceRepository = new DagInstanceRepositoryImpl(),
        jobInstanceRepository = new JobInstanceRepositoryImpl()
      ),
      dagInstanceRepository = new DagInstanceRepositoryImpl()
    )
  }

}
