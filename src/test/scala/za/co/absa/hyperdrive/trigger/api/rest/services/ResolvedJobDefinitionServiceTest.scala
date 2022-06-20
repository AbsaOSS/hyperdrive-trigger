
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

import org.scalatest.{BeforeAndAfter, FlatSpec, Matchers}
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes
import za.co.absa.hyperdrive.trigger.models.{ResolvedJobDefinition, SparkInstanceParameters}


class ResolvedJobDefinitionServiceTest extends FlatSpec with Matchers with BeforeAndAfter {
  private val underTest = new ResolvedJobDefinitionServiceImpl()

  "resolveAppArguments" should "successfully parse a file" in {
    val jobDefinition = ResolvedJobDefinition(
      "job",
      SparkInstanceParameters(
        jobType = JobTypes.Hyperdrive,
        jobJar = "job.jar",
        mainClass = "mainClass",
        appArguments = List(
          "reader.kafka.topic=my-topic",
          "writer.common.checkpoint.location=/checkpoint/path/${reader.kafka.topic}"
        )
      ),
      order = 1
    )
    val result = underTest.resolveAppArguments(jobDefinition)

    result.jobParameters.asInstanceOf[SparkInstanceParameters].appArguments should contain theSameElementsAs
      Seq("reader.kafka.topic=my-topic", "writer.common.checkpoint.location=/checkpoint/path/my-topic")
  }

}
