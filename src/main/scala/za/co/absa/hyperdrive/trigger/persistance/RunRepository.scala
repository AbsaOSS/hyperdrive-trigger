/*
 * Copyright 2018-2019 ABSA Group Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package za.co.absa.hyperdrive.trigger.persistance

import za.co.absa.hyperdrive.trigger.models.{OverallStatistics, PerDagStatistics, PerProjectStatistics, PerWorkflowStatistics}
import za.co.absa.hyperdrive.trigger.models.tables.JdbcTypeMapper._
import za.co.absa.hyperdrive.trigger.models.enums.{DagInstanceStatuses, JobStatuses}
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.{InQueue, Succeeded}
import za.co.absa.hyperdrive.trigger.models.tables.JDBCProfile.profile._

import scala.concurrent.{ExecutionContext, Future}

trait RunRepository extends Repository {
  def getOverallStatistics()(implicit ec: ExecutionContext): Future[OverallStatistics]
  def getPerDagStatistics(workflowId: Long)(implicit ec: ExecutionContext): Future[Seq[PerDagStatistics]]
  def getPerProjectStatistics()(implicit ec: ExecutionContext): Future[Seq[PerProjectStatistics]]
  def getPerWorkflowStatistics(projectName: String)(implicit ec: ExecutionContext): Future[Seq[PerWorkflowStatistics]]
}

class RunRepositoryImpl extends RunRepository {

  override def getOverallStatistics()(implicit ec: ExecutionContext): Future[OverallStatistics] = db.run {
    (
      jobInstanceTable.filter(_.jobStatus.inSet(Seq(Succeeded))).size,
      jobInstanceTable.filter(_.jobStatus.inSet(JobStatuses.statuses.filter(_.isFailed))).size,
      jobInstanceTable.filter(_.jobStatus.inSet(JobStatuses.statuses.filter(_.isRunning))).size,
      jobInstanceTable.filter(_.jobStatus.inSet(Seq(InQueue))).size
    ).result.map((OverallStatistics.apply _).tupled(_))
  }

  override def getPerDagStatistics(workflowId: Long)(implicit ec: ExecutionContext): Future[Seq[PerDagStatistics]] = {
    db.run {(
      for {
        dag <- dagInstanceTable if dag.workflowId === workflowId
      } yield {
        val jobInstances = jobInstanceTable.filter(_.dagInstanceId === dag.id)
        (
          dag.id,
          jobInstances.size,
          jobInstances.filter(_.jobStatus.inSet(Seq(Succeeded))).size,
          jobInstances.filter(_.jobStatus.inSet(JobStatuses.statuses.filter(_.isFailed))).size,
          jobInstances.filter(_.jobStatus.inSet(Seq(JobStatuses.InQueue))).size,
          jobInstances.filter(_.jobStatus.inSet(JobStatuses.statuses.filter(_.isRunning))).size
        )
      }).sortBy(_._1).result
    }.map(_.map((PerDagStatistics.apply _).tupled(_)))
  }

  override def getPerProjectStatistics()(implicit ec: ExecutionContext): Future[Seq[PerProjectStatistics]] = {
    db.run {(
      for {
        workflow <- workflowTable
      } yield {
        val dagInstances = dagInstanceTable.filter(_.workflowId === workflow.id)
        (
          workflow.project,
          dagInstances.size,
          dagInstances.filter(_.status.inSet(Seq(DagInstanceStatuses.Succeeded))).size,
          dagInstances.filter(_.status.inSet(DagInstanceStatuses.statuses.filter(_.isFailed))).size,
          dagInstances.filter(_.status.inSet(Seq(DagInstanceStatuses.InQueue))).size,
          dagInstances.filter(_.status.inSet(DagInstanceStatuses.statuses.filter(_.isRunning))).size
        )
      }).sortBy(_._1).result
    }.map(_.map((PerProjectStatistics.apply _).tupled(_))).map(_.foldLeft(Seq.empty[PerProjectStatistics]){
      case (acc, i) if acc.exists(_.projectName == i.projectName) => {
        val oneProject = acc.filter(_.projectName == i.projectName) :+ i
        acc.filter(_.projectName != i.projectName) :+ PerProjectStatistics(
          projectName = i.projectName,
          total = oneProject.map(_.total).sum,
          successful = oneProject.map(_.successful).sum,
          failed = oneProject.map(_.failed).sum,
          queued = oneProject.map(_.queued).sum,
          running = oneProject.map(_.running).sum
        )
      }
      case (acc, i) if !acc.exists(_.projectName == i.projectName) => acc :+ i
    })
  }

  override def getPerWorkflowStatistics(projectName: String)(implicit ec: ExecutionContext): Future[Seq[PerWorkflowStatistics]] = {
    db.run {(
      for {
        workflow <- workflowTable.filter(_.project === projectName)
      } yield {
        val dagInstances = dagInstanceTable.filter(_.workflowId === workflow.id)
        (
          workflow.id,
          workflow.name,
          workflow.isActive,
          dagInstances.size,
          dagInstances.filter(_.status.inSet(Seq(DagInstanceStatuses.Succeeded))).size,
          dagInstances.filter(_.status.inSet(DagInstanceStatuses.statuses.filter(_.isFailed))).size,
          dagInstances.filter(_.status.inSet(Seq(DagInstanceStatuses.InQueue))).size,
          dagInstances.filter(_.status.inSet(DagInstanceStatuses.statuses.filter(_.isRunning))).size
        )
      }).sortBy(_._2).result
    }.map(_.map((PerWorkflowStatistics.apply _).tupled(_)))
  }
}