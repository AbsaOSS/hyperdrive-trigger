package za.co.absa.hyperdrive.trigger.persistance

import za.co.absa.hyperdrive.trigger.models.DagDefinitionJoined
import za.co.absa.hyperdrive.trigger.models.tables.JDBCProfile.profile._

import scala.concurrent.{ExecutionContext, Future}

trait DagDefinitionRepository extends Repository {
  def getJoinedDagDefinition(sensorId: Long)(implicit executionContext: ExecutionContext): Future[Option[DagDefinitionJoined]]
}

class DagDefinitionRepositoryImpl extends DagDefinitionRepository {

  def getJoinedDagDefinition(sensorId: Long)(implicit executionContext: ExecutionContext): Future[Option[DagDefinitionJoined]] = {
    db.run((
      for {
        s <- sensorTable if s.id === sensorId
        w <- workflowTable if w.id === s.workflowId
        d <- dagDefinitionTable if d.workflowId === w.id
        j <- jobDefinitionTable if j.dagDefinitionId === d.id
      } yield {
        (d, j)
      }
    ).result).map(_.groupBy(_._1).headOption.map(grouped => DagDefinitionJoined(grouped._1, grouped._2.map(_._2))))
  }

}