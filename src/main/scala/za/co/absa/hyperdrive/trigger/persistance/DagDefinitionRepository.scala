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
import za.co.absa.hyperdrive.trigger.models.DagDefinitionJoined

import scala.concurrent.{ExecutionContext, Future}

trait DagDefinitionRepository extends Repository {
  def getJoinedDagDefinition(sensorId: Long)(implicit executionContext: ExecutionContext): Future[Option[DagDefinitionJoined]]
}

@stereotype.Repository
class DagDefinitionRepositoryImpl extends DagDefinitionRepository {
  import api._

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
