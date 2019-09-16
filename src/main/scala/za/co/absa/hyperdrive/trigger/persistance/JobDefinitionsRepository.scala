package za.co.absa.hyperdrive.trigger.persistance

import za.co.absa.hyperdrive.trigger.models.JobDefinition
import za.co.absa.hyperdrive.trigger.models.tables.JDBCProfile.profile._
import scala.concurrent.{ExecutionContext, Future}

trait JobDefinitionsRepository extends Repository {
  def getJobDefinition(sensorId: Long)(implicit ec: ExecutionContext): Future[Option[JobDefinition]]
}

class JobDefinitionsRepositoryImpl extends JobDefinitionsRepository {

  override def getJobDefinition(sensorId: Long)(implicit ec: ExecutionContext): Future[Option[JobDefinition]] = db.run{(
    for {
      s <- sensorTable if s.id === sensorId
      w <- workflowTable if w.id === s.workflowId
      jd <- jobDefinitionTable if w.id === jd.workflowId
    } yield {
      jd
    }).result.headOption
  }

}