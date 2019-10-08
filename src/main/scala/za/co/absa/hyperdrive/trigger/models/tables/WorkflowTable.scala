package za.co.absa.hyperdrive.trigger.models.tables

import java.time.LocalDateTime

import za.co.absa.hyperdrive.trigger.models.Workflow
import slick.lifted.ProvenShape
import za.co.absa.hyperdrive.trigger.models.tables.JDBCProfile.profile._

final class WorkflowTable(tag: Tag) extends Table[Workflow](tag, _tableName = "workflow") {
  def name: Rep[String] = column[String]("name", O.Unique, O.Length(45))
  def isActive: Rep[Boolean] = column[Boolean]("is_active")
  def project: Rep[String] = column[String]("project")
  def created: Rep[LocalDateTime] = column[LocalDateTime]("created")
  def updated: Rep[Option[LocalDateTime]] = column[Option[LocalDateTime]]("updated")
  def id: Rep[Long] = column[Long]("id", O.PrimaryKey, O.AutoInc, O.SqlType("BIGSERIAL"))

  def * : ProvenShape[Workflow] = (name, isActive, project, created, updated, id) <> (
    workflowTuple =>
      Workflow.apply(
        name = workflowTuple._1,
        isActive = workflowTuple._2,
        project = workflowTuple._3,
        created = workflowTuple._4,
        updated = workflowTuple._5,
        id = workflowTuple._6
      ),
    Workflow.unapply
  )

}