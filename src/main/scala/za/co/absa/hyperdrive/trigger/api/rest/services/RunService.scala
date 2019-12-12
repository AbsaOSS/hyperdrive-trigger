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

package za.co.absa.hyperdrive.trigger.api.rest.services

import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.models.{OverallStatistics, PerDagStatistics, PerProjectStatistics, PerWorkflowStatistics}
import za.co.absa.hyperdrive.trigger.persistance.RunRepository

import scala.concurrent.{ExecutionContext, Future}

trait RunService {
  val runRepository: RunRepository
  def getOverallStatistics()(implicit ec: ExecutionContext): Future[OverallStatistics]
  def getPerDagStatistics(workflowId: Long)(implicit ec: ExecutionContext): Future[Seq[PerDagStatistics]]
  def getPerProjectStatistics()(implicit ec: ExecutionContext): Future[Seq[PerProjectStatistics]]
  def getPerWorkflowStatistics(projectName: String)(implicit ec: ExecutionContext): Future[Seq[PerWorkflowStatistics]]
}

@Service
class RunServiceImpl(override val runRepository: RunRepository) extends RunService {

  override def getOverallStatistics()(implicit ec: ExecutionContext): Future[OverallStatistics] = {
    runRepository.getOverallStatistics()
  }

  override def getPerDagStatistics(workflowId: Long)(implicit ec: ExecutionContext): Future[Seq[PerDagStatistics]] = {
    runRepository.getPerDagStatistics(workflowId)
  }

  override def getPerProjectStatistics()(implicit ec: ExecutionContext): Future[Seq[PerProjectStatistics]] = {
    runRepository.getPerProjectStatistics()
  }

  override def getPerWorkflowStatistics(projectName: String)(implicit ec: ExecutionContext): Future[Seq[PerWorkflowStatistics]] = {
    runRepository.getPerWorkflowStatistics(projectName)
  }

}
