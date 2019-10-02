package za.co.absa.hyperdrive.trigger.models.tables

import slick.lifted.{ForeignKeyQuery, ProvenShape}
import za.co.absa.hyperdrive.trigger.models.{DagInstance, Workflow}
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses.DagInstanceStatus
import za.co.absa.hyperdrive.trigger.models.tables.JDBCProfile.profile._
import za.co.absa.hyperdrive.trigger.models.tables.JdbcTypeMapper._

final class DagInstanceTable(tag: Tag) extends Table[DagInstance](tag, _tableName = "dag_instance") {

  def status: Rep[DagInstanceStatus] = column[DagInstanceStatus]("status")
  def workflowId: Rep[Long] = column[Long]("workflow_id")
  def id: Rep[Long] = column[Long]("id", O.PrimaryKey, O.AutoInc, O.SqlType("BIGSERIAL"))

  def workflow_fk: ForeignKeyQuery[WorkflowTable, Workflow] =
    foreignKey("dag_instance_workflow_fk", workflowId, TableQuery[WorkflowTable])(_.id)

  def * : ProvenShape[DagInstance] = (status, workflowId, id) <> (
    dagInstanceTuple =>
      DagInstance.apply(
        status = dagInstanceTuple._1,
        workflowId = dagInstanceTuple._2,
        id = dagInstanceTuple._3
      ),
    DagInstance.unapply
  )

}