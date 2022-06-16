
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

import org.scalatest.{FlatSpec, Matchers}
import za.co.absa.hyperdrive.trigger.configuration.application.{TestGeneralConfig, TestKafkaConfig}
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes
import za.co.absa.hyperdrive.trigger.models.{ResolvedJobDefinition, ShellInstanceParameters, SparkInstanceParameters}

class KafkaServiceTest extends FlatSpec with Matchers {
  val underTest = new KafkaServiceImpl(TestKafkaConfig(), TestGeneralConfig())

  "getKafkaProperties" should "get kafka properties from a resolved job definition" in {
    val jobDefinition = ResolvedJobDefinition(
      "job",
      SparkInstanceParameters(
        jobType = JobTypes.Hyperdrive,
        jobJar = "job.jar",
        mainClass = "mainClass",
        appArguments = List(
          "reader.kafka.topic=some-topic",
          "reader.kafka.brokers=http://localhost:9092",
          "reader.option.kafka.security.protocol=PLAINTEXT"
        )
      ),
      order = 1
    )

    val result = underTest.getKafkaProperties(jobDefinition)

    result.isDefined shouldBe true
    result.get._1 shouldBe "some-topic"
    val properties = result.get._2
    properties.getProperty("bootstrap.servers") shouldBe "http://localhost:9092"
    properties.getProperty("security.protocol") shouldBe "PLAINTEXT"
  }

  it should "return None if the topic is not in the app arguments" in {
    val jobDefinition = ResolvedJobDefinition(
      "job",
      SparkInstanceParameters(
        jobType = JobTypes.Hyperdrive,
        jobJar = "job.jar",
        mainClass = "mainClass",
        appArguments = List("reader.kafka.brokers=http://localhost:9092")
      ),
      order = 1
    )

    val result = underTest.getKafkaProperties(jobDefinition)

    result shouldBe None
  }

  it should "return None if the kafka brokers are not in the app arguments" in {
    val jobDefinition = ResolvedJobDefinition(
      "job",
      SparkInstanceParameters(
        jobType = JobTypes.Hyperdrive,
        jobJar = "job.jar",
        mainClass = "mainClass",
        appArguments = List("reader.kafka.topic=some-topic")
      ),
      order = 1
    )

    val result = underTest.getKafkaProperties(jobDefinition)

    result shouldBe None
  }

  it should "return None if the job type is not Hyperdrive" in {
    val jobDefinition = ResolvedJobDefinition(
      "job",
      SparkInstanceParameters(
        jobType = JobTypes.Spark,
        jobJar = "job.jar",
        mainClass = "mainClass",
        appArguments = List("reader.kafka.topic=some-topic", "reader.kafka.brokers=http://localhost:9092")
      ),
      order = 1
    )

    val result = underTest.getKafkaProperties(jobDefinition)

    result shouldBe None
  }

  it should "return None if the jobParameters are not SparkInstanceParameters" in {
    val jobDefinition = ResolvedJobDefinition(
      "inconsistentJob",
      ShellInstanceParameters(
        jobType = JobTypes.Hyperdrive,
        scriptLocation = "script.sh"
      ),
      order = 1
    )

    val result = underTest.getKafkaProperties(jobDefinition)

    result shouldBe None
  }
}
