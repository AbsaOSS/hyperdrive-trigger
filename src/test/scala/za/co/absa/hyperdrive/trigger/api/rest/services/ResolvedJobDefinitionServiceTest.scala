
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

import org.scalatest.mockito.MockitoSugar
import org.scalatest.{BeforeAndAfter, FlatSpec, Matchers}
import za.co.absa.hyperdrive.trigger.configuration.application.DefaultTestSparkConfig
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes
import za.co.absa.hyperdrive.trigger.models.{ResolvedJobDefinition, ShellInstanceParameters, SparkInstanceParameters}


class ResolvedJobDefinitionServiceTest extends FlatSpec with Matchers with BeforeAndAfter with MockitoSugar {
  private val hdfsService = mock[HdfsService]
  private val kafkaService = mock[KafkaService]
  private val underTest = new ResolvedJobDefinitionServiceImpl(DefaultTestSparkConfig().yarn, hdfsService, kafkaService)

  "getResolvedAppArguments" should "return the resolved app arguments" in {
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
    val result = underTest.getResolvedAppArguments(jobDefinition)

    result.isDefined shouldBe true
    result.get should contain theSameElementsAs Map(
      "reader.kafka.topic" -> "my-topic",
      "writer.common.checkpoint.location" -> "/checkpoint/path/my-topic"
    )
  }

  it should "return None if the job type is not hyperdrive" in {
    val jobDefinition = ResolvedJobDefinition(
      "job",
      SparkInstanceParameters(
        jobType = JobTypes.Spark,
        jobJar = "job.jar",
        mainClass = "mainClass",
        appArguments = List(
          "reader.kafka.topic=my-topic",
          "writer.common.checkpoint.location=/checkpoint/path/${reader.kafka.topic}"
        )
      ),
      order = 1
    )

    val result = underTest.getResolvedAppArguments(jobDefinition)

    result shouldBe None
  }

  "getHdfsParameters" should "get the hdfs parameters from the configs" in {
    val config = DefaultTestSparkConfig().copy(additionalConfs = Map(
      "spark.yarn.keytab" -> "/path/to/keytab",
      "spark.yarn.principal" -> "principal"
    ))
    val underTest = new ResolvedJobDefinitionServiceImpl(config.yarn, hdfsService, kafkaService)
    val appArguments = Map(
      "writer.common.checkpoint.location" -> "/checkpoint/path/my-topic"
    )

    val params = underTest.getHdfsParameters(appArguments)

    params.isDefined shouldBe true
    params.get.keytab shouldBe "/path/to/keytab"
    params.get.principal shouldBe "principal"
    params.get.checkpointLocation shouldBe "/checkpoint/path/my-topic"
  }


  "getKafkaParameters" should "get kafka properties from a resolved job definition" in {
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

    val result = underTest.getKafkaParameters(jobDefinition)

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

    val result = underTest.getKafkaParameters(jobDefinition)

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

    val result = underTest.getKafkaParameters(jobDefinition)

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

    val result = underTest.getKafkaParameters(jobDefinition)

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

    val result = underTest.getKafkaParameters(jobDefinition)

    result shouldBe None
  }
}
