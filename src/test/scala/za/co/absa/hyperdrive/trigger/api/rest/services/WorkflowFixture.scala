
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

package za.co.absa.hyperdrive.trigger.api.rest.services

import java.time.LocalDateTime

import za.co.absa.hyperdrive.trigger.models.{DagDefinitionJoined, JobDefinition, JobParameters, Properties, Sensor, Settings, WorkflowJoined}
import za.co.absa.hyperdrive.trigger.models.enums.{JobTypes, SensorTypes}

object WorkflowFixture {

  def createWorkflowJoined() = {
    WorkflowJoined(
      id = 10,
      name = "testWorkflow",
      isActive = true,
      created = LocalDateTime.of(2020, 2, 29, 10, 59, 34),
      updated = None,
      project = "testProject",
      sensor = Sensor(
        workflowId = 0,
        sensorType = SensorTypes.AbsaKafka,
        properties = Properties(
          sensorId = 0,
          settings = Settings(
            variables = Map("topic" -> "testTopic"),
            maps = Map("servers" -> List("http://localhost:9093", "http://localhost:9092"))
          ),
          matchProperties = Map("ingestionToken" -> "abcdef-123456")
        )
      ),
      dagDefinitionJoined = DagDefinitionJoined(
        workflowId = 0,
        jobDefinitions = Seq(
          JobDefinition(
            dagDefinitionId = 0,
            name = "TestJob1",
            jobType = JobTypes.Spark,
            jobParameters = JobParameters(
              variables = Map("jobJar" -> "/dir/driver.jar",
                "mainClass" -> "aaa.bbb.TestClass",
                "deploymentMode" -> "cluster"
              ),
              maps = Map("aaa" -> List("bbb", "ccc"))
            ),
            order = 1
          ),
          JobDefinition(
            dagDefinitionId = 0,
            name = "TestJob2",
            jobType = JobTypes.Shell,
            jobParameters = JobParameters(
              variables = Map("jobJar" -> "/dir/driver.jar",
                "mainClass" -> "aaa.bbb.TestClass"
              ),
              maps = Map("appArguments" -> List("--arg1=value1", "--arg2=value2"))
            ),
            order = 2
          )
        )
      )
    )
  }
}
