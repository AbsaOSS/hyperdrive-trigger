
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

package za.co.absa.hyperdrive.trigger.testdata

import java.util.concurrent.TimeUnit

import javax.inject.Inject
import org.scalatest.{FlatSpec, Matchers}
import za.co.absa.hyperdrive.trigger.SpringIntegrationTest
import za.co.absa.hyperdrive.trigger.api.rest.services.WorkflowService

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.Duration

class AppArgumentsSorter extends FlatSpec with Matchers with SpringIntegrationTest with LocalDatabaseConfig {

  @Inject() var workflowService: WorkflowService = _

  private def appArgumentsSort(arg1: String, arg2: String) = {
    val arg1PrefixOrder = getPrefixOrder(arg1)
    val arg2PrefixOrder = getPrefixOrder(arg2)

    if (arg1PrefixOrder == arg2PrefixOrder) {
      arg1.compareTo(arg2) < 0
    } else {
      arg1PrefixOrder < arg2PrefixOrder
    }
  }

  private def getPrefixOrder(arg: String): Int = {
    if (arg.startsWith("component")) 0
    else if (arg.startsWith("ingestor")) 1
    else if (arg.startsWith("manager")) 2
    else if (arg.startsWith("reader")) 3
    else if (arg.startsWith("decoder")) 4
    else if (arg.startsWith("transformer")) 5
    else if (arg.startsWith("writer")) 6
    else 100
  }

  it should "sort app arguments" taggedAs PersistingData in {
    val workflowIds = Await.result(workflowService.getWorkflows(), Duration(120, TimeUnit.SECONDS)).map(_.id)
//    val workflowIds = Seq(91)
    val workflows = workflowIds.map(workflowId =>
      Await.result(workflowService.getWorkflow(workflowId), Duration(120, TimeUnit.SECONDS)))

    val updatedWorkflows = workflows.map(workflow => workflow.copy(dagDefinitionJoined = workflow.dagDefinitionJoined.copy(
      jobDefinitions = workflow.dagDefinitionJoined.jobDefinitions
        .map(jobDefinition => {
          val variables = jobDefinition.jobParameters.variables
          val maps2 = jobDefinition.jobParameters.maps
          if (variables.contains("mainClass") && variables("mainClass") == "za.co.absa.hyperdrive.driver.drivers.CommandLineIngestionDriver"
            && maps2.contains("appArguments")) {
            val sortedAppArguments = jobDefinition.jobParameters.maps("appArguments").sortWith(appArgumentsSort)
            jobDefinition.copy(jobParameters = jobDefinition.jobParameters.copy(
              maps = maps2 - "appArguments" + ("appArguments" -> sortedAppArguments)))
          } else {
            jobDefinition
          }
        }))))

    updatedWorkflows.foreach(w =>
      Await.result(workflowService.updateWorkflow(w), Duration(120, TimeUnit.SECONDS)))
  }
}
