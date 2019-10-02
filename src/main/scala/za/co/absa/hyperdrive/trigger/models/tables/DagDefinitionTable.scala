package za.co.absa.hyperdrive.trigger.models.tables

import slick.lifted.{ForeignKeyQuery, ProvenShape}
import za.co.absa.hyperdrive.trigger.models.tables.JDBCProfile.profile._
import za.co.absa.hyperdrive.trigger.models.{DagDefinition, Workflow}

final class DagDefinitionTable(tag: Tag) extends Table[DagDefinition](tag, _tableName = "dag_definition") {

  def workflowId: Rep[Long] = column[Long]("workflow_id")
  def id: Rep[Long] = column[Long]("id", O.PrimaryKey, O.AutoInc, O.SqlType("BIGSERIAL"))

  def workflow_fk: ForeignKeyQuery[WorkflowTable, Workflow] =
    foreignKey("dag_definition_workflow_fk", workflowId, TableQuery[WorkflowTable])(_.id)

  def * : ProvenShape[DagDefinition] = (workflowId, id) <> (
    dagDefinitionTuple =>
      DagDefinition.apply(
        workflowId = dagDefinitionTuple._1,
        id = dagDefinitionTuple._2
      ),
    DagDefinition.unapply
  )

}