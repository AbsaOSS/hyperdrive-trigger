package za.co.absa.hyperdrive.trigger.persistance

import za.co.absa.hyperdrive.trigger.models.Sensor
import za.co.absa.hyperdrive.trigger.models.tables.JDBCProfile.profile._
import scala.concurrent.{ExecutionContext, Future}

trait SensorRepository extends Repository {
  def getNewActiveSensors(idsToFilter: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[Sensor]]
  def getInactiveSensors(ids: Seq[Long])(implicit ec: ExecutionContext): Future[Seq[Long]]
}

class SensorRepositoryImpl extends SensorRepository {

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

}
