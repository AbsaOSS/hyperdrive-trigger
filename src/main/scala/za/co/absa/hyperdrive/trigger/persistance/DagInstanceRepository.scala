package za.co.absa.hyperdrive.trigger.persistance

import slick.dbio.DBIO
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses
import za.co.absa.hyperdrive.trigger.models.{DagInstance, DagInstanceJoined, Event}
import za.co.absa.hyperdrive.trigger.models.tables.JDBCProfile.profile._
import za.co.absa.hyperdrive.trigger.models.tables.JdbcTypeMapper._

import scala.concurrent.{ExecutionContext, Future}

trait DagInstanceRepository extends Repository {
  def insertJoinedDagInstances(dagInstancesJoined: Seq[(DagInstanceJoined, Event)], events: Seq[Event])(implicit executionContext: ExecutionContext): Future[Unit]
  def insertJoinedDagInstance(dagInstanceJoined: DagInstanceJoined)(implicit executionContext: ExecutionContext): Future[Unit]
  def getNewActiveDags(idToFilter: Seq[Long], size: Int): Future[Seq[DagInstance]]
  def update(dagInstance: DagInstance): Future[Unit]
}

class DagInstanceRepositoryImpl extends DagInstanceRepository {

  override def insertJoinedDagInstances(dagInstancesJoined: Seq[(DagInstanceJoined, Event)], events: Seq[Event])(implicit executionContext: ExecutionContext): Future[Unit] = db.run(
    DBIO.sequence {
      dagInstancesJoined.map { dagInstanceJoined =>
        for {
          di <- dagInstanceTable returning dagInstanceTable.map(_.id) += dagInstanceJoined._1.toDagInstance
          e <- eventTable += dagInstanceJoined._2.copy(dagInstanceId = Option(di))
          jis <- jobInstanceTable ++= dagInstanceJoined._1.jobInstances.map(_.copy(dagInstanceId = di))
        } yield ()
      }
    }.andThen(eventTable ++= events).transactionally
  ).map(_ => (): Unit)

  override def insertJoinedDagInstance(dagInstanceJoined: DagInstanceJoined)(implicit executionContext: ExecutionContext): Future[Unit] = db.run(
    (for {
      di <- dagInstanceTable returning dagInstanceTable.map(_.id) += dagInstanceJoined.toDagInstance
      jis <- jobInstanceTable ++= dagInstanceJoined.jobInstances.map(_.copy(dagInstanceId = di))
    } yield ()).transactionally
  ).map(_ => (): Unit)

  override def getNewActiveDags(idToFilter: Seq[Long], size: Int): Future[Seq[DagInstance]] = db.run(
    dagInstanceTable.filter(ji =>
      !ji.id.inSet(idToFilter) && ji.status.inSet(DagInstanceStatuses.finalStatuses)
    ).take(size).result
  )

  override def update(dagInstance: DagInstance): Future[Unit] = db.run(
    dagInstanceTable.filter(_.id === dagInstance.id).update(dagInstance).andThen(DBIO.successful((): Unit))
  )

}