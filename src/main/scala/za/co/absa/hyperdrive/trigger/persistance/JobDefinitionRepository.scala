/*
 * Copyright 2018 ABSA Group Limited
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


import org.springframework.stereotype
import za.co.absa.hyperdrive.trigger.models.JobForRun

import scala.concurrent.{ExecutionContext, Future}

trait JobDefinitionRepository extends Repository {
  def getJobsForRun(workflowId: Long)(implicit ec: ExecutionContext): Future[Seq[JobForRun]]
}

@stereotype.Repository
class JobDefinitionRepositoryImpl extends JobDefinitionRepository {
  import api._

  override def getJobsForRun(workflowId: Long)(implicit ec: ExecutionContext): Future[Seq[JobForRun]] = db.run {
    (for {
      dagDefinition <- dagDefinitionTable if dagDefinition.workflowId === workflowId
      jobDefinition <- jobDefinitionTable.map(row => (row.dagDefinitionId, row.name, row.order, row.id)) if dagDefinition.id === jobDefinition._1
    } yield {
      jobDefinition
    }).result.map(_.map(row => JobForRun(row._2, row._3, row._4)))
  }

}
