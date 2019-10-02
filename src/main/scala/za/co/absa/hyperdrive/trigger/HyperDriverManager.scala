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
