package za.co.absa.hyperdrive.trigger.scheduler.sensors

import za.co.absa.hyperdrive.trigger.models.{Event, SensorProperties}

import scala.concurrent.{ExecutionContext, Future}

trait Sensor {
  val eventsProcessor: (Seq[Event], SensorProperties) => Future[Boolean]
  val sensorProperties: SensorProperties
  implicit val executionContext: ExecutionContext
  def close(): Unit
}

abstract class PollSensor(
  override val eventsProcessor: (Seq[Event], SensorProperties) => Future[Boolean],
  override val sensorProperties: SensorProperties,
  override val executionContext: ExecutionContext
) extends Sensor {
  implicit val ec: ExecutionContext = executionContext
  def poll(): Future[Unit]
}

abstract class PushSensor(
  override val eventsProcessor: (Seq[Event], SensorProperties) => Future[Boolean],
  override val sensorProperties: SensorProperties,
  override val executionContext: ExecutionContext
) extends Sensor {
  implicit val ec: ExecutionContext = executionContext
  def push(events: Seq[Event]): Future[Unit]
}