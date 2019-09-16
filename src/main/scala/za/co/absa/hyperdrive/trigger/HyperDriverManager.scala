package za.co.absa.hyperdrive.trigger

import za.co.absa.hyperdrive.trigger.persistance.{EventRepositoryImpl, SensorRepositoryImpl, JobDefinitionsRepositoryImpl, JobInstanceRepositoryImpl}
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
        new EventProcessor(
          new EventRepositoryImpl(),
          new JobDefinitionsRepositoryImpl(),
          new JobInstanceRepositoryImpl()
        ),
        new SensorRepositoryImpl()
      ),
      executors = new Executors(new JobInstanceRepositoryImpl()),
      jobInstanceRepository = new JobInstanceRepositoryImpl()
    )
  }

}
