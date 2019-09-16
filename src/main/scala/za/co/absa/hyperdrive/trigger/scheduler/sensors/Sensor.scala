package za.co.absa.hyperdrive.trigger.scheduler.sensors

import za.co.absa.hyperdrive.trigger.models.{Event, Properties}

import scala.concurrent.{ExecutionContext, Future}

trait Sensor {
  val eventsProcessor: (Seq[Event], Properties) => Future[Boolean]
  val properties: Properties
  implicit val executionContext: ExecutionContext
  def close(): Unit
}

abstract class PollSensor(
  override val eventsProcessor: (Seq[Event], Properties) => Future[Boolean],
  override val properties: Properties,
  override val executionContext: ExecutionContext
) extends Sensor {
  implicit val ec: ExecutionContext = executionContext
  def poll(): Future[Unit]
}

abstract class PushSensor(
  override val eventsProcessor: (Seq[Event], Properties) => Future[Boolean],
  override val properties: Properties,
  override val executionContext: ExecutionContext
) extends Sensor {
  implicit val ec: ExecutionContext = executionContext
  def push(events: Seq[Event]): Future[Unit]
}