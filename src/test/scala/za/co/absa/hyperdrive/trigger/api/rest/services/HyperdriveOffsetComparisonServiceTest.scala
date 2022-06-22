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

import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.{any, eq => eqTo}
import org.mockito.Mockito.{never, reset, verify, when}
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{BeforeAndAfter, FlatSpec, Matchers}
import za.co.absa.hyperdrive.trigger.configuration.application.DefaultTestSparkConfig
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes
import za.co.absa.hyperdrive.trigger.models.{ResolvedJobDefinition, ShellInstanceParameters, SparkInstanceParameters}

class HyperdriveOffsetComparisonServiceTest extends FlatSpec with Matchers with BeforeAndAfter with MockitoSugar {
  private val hdfsService = mock[HdfsService]
  private val kafkaService = mock[KafkaService]
  private val underTest =
    new HyperdriveOffsetComparisonServiceImpl(DefaultTestSparkConfig().yarn, hdfsService, kafkaService)

  before {
    reset(hdfsService)
    reset(kafkaService)
  }

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
    val config = DefaultTestSparkConfig().copy(additionalConfs =
      Map(
        "spark.yarn.keytab" -> "/path/to/keytab",
        "spark.yarn.principal" -> "principal"
      )
    )
    val underTest = new HyperdriveOffsetComparisonServiceImpl(config.yarn, hdfsService, kafkaService)
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

  "isNewJobInstanceRequired" should "return false if the kafka and checkpoint folder offsets are the same" in {
    val config = DefaultTestSparkConfig().copy(additionalConfs =
      Map(
        "spark.yarn.keytab" -> "/path/to/keytab",
        "spark.yarn.principal" -> "principal"
      )
    )
    val underTest = new HyperdriveOffsetComparisonServiceImpl(config.yarn, hdfsService, kafkaService)
    val jobDefinition = ResolvedJobDefinition(
      "job",
      SparkInstanceParameters(
        jobType = JobTypes.Hyperdrive,
        jobJar = "job.jar",
        mainClass = "mainClass",
        appArguments = List(
          "reader.kafka.topic=some-topic",
          "reader.kafka.brokers=http://localhost:9092",
          "writer.common.checkpoint.location=/checkpoint/path/${reader.kafka.topic}"
        )
      ),
      order = 1
    )

    when(hdfsService.getLatestOffsetFilePath(any())).thenReturn(Some(("/checkpoint/path/some-topic/offsets/21", true)))
    when(hdfsService.parseFileAndClose(any(), any[Iterator[String] => Map[String, Map[Int, Long]]]()))
      .thenReturn(Option(Map("some-topic" -> Map(2 -> 2021L, 0 -> 21L, 1 -> 1021L))))
    when(kafkaService.getEndOffsets(any(), any())).thenReturn(Map(0 -> 21L, 1 -> 1021L, 2 -> 2021L))

    val result = underTest.isNewJobInstanceRequired(jobDefinition)

    val hdfsParametersCaptor: ArgumentCaptor[HdfsParameters] = ArgumentCaptor.forClass(classOf[HdfsParameters])
    verify(hdfsService).getLatestOffsetFilePath(hdfsParametersCaptor.capture())
    hdfsParametersCaptor.getValue.keytab shouldBe "/path/to/keytab"
    hdfsParametersCaptor.getValue.principal shouldBe "principal"
    hdfsParametersCaptor.getValue.checkpointLocation shouldBe "/checkpoint/path/some-topic"
    verify(hdfsService).parseFileAndClose(eqTo("/checkpoint/path/some-topic/offsets/21"), any())
    verify(kafkaService).getEndOffsets(eqTo("some-topic"), any())
    result shouldBe false
  }

  it should "return true if no offset file is present" in {
    val config = DefaultTestSparkConfig().copy(additionalConfs =
      Map(
        "spark.yarn.keytab" -> "/path/to/keytab",
        "spark.yarn.principal" -> "principal"
      )
    )
    val underTest = new HyperdriveOffsetComparisonServiceImpl(config.yarn, hdfsService, kafkaService)
    val jobDefinition = ResolvedJobDefinition(
      "job",
      SparkInstanceParameters(
        jobType = JobTypes.Hyperdrive,
        jobJar = "job.jar",
        mainClass = "mainClass",
        appArguments = List(
          "writer.common.checkpoint.location=/checkpoint/path/${reader.kafka.topic}"
        )
      ),
      order = 1
    )
    when(hdfsService.getLatestOffsetFilePath(any())).thenReturn(None)

    val result = underTest.isNewJobInstanceRequired(jobDefinition)

    verify(hdfsService).getLatestOffsetFilePath(any())
    result shouldBe true
  }

  it should "return true if the offset is not committed" in {
    val config = DefaultTestSparkConfig().copy(additionalConfs =
      Map(
        "spark.yarn.keytab" -> "/path/to/keytab",
        "spark.yarn.principal" -> "principal"
      )
    )
    val underTest = new HyperdriveOffsetComparisonServiceImpl(config.yarn, hdfsService, kafkaService)
    val jobDefinition = ResolvedJobDefinition(
      "job",
      SparkInstanceParameters(
        jobType = JobTypes.Hyperdrive,
        jobJar = "job.jar",
        mainClass = "mainClass",
        appArguments = List(
          "writer.common.checkpoint.location=/checkpoint/path/${reader.kafka.topic}"
        )
      ),
      order = 1
    )
    when(hdfsService.getLatestOffsetFilePath(any())).thenReturn(Some(("1", false)))

    val result = underTest.isNewJobInstanceRequired(jobDefinition)

    verify(hdfsService).getLatestOffsetFilePath(any())
    result shouldBe true
  }

  it should "return true if a offset file could not be parsed" in {
    val config = DefaultTestSparkConfig().copy(additionalConfs =
      Map(
        "spark.yarn.keytab" -> "/path/to/keytab",
        "spark.yarn.principal" -> "principal"
      )
    )
    val underTest = new HyperdriveOffsetComparisonServiceImpl(config.yarn, hdfsService, kafkaService)
    val jobDefinition = ResolvedJobDefinition(
      "job",
      SparkInstanceParameters(
        jobType = JobTypes.Hyperdrive,
        jobJar = "job.jar",
        mainClass = "mainClass",
        appArguments = List(
          "reader.kafka.topic=some-topic",
          "reader.kafka.brokers=http://localhost:9092",
          "writer.common.checkpoint.location=/checkpoint/path/${reader.kafka.topic}"
        )
      ),
      order = 1
    )

    when(hdfsService.getLatestOffsetFilePath(any())).thenReturn(Some(("1", true)))
    when(hdfsService.parseFileAndClose(any(), any[Iterator[String] => Map[String, Map[Int, Long]]]()))
      .thenThrow(new RuntimeException("Failed to parse"))

    val result = underTest.isNewJobInstanceRequired(jobDefinition)

    verify(hdfsService).getLatestOffsetFilePath(any())
    verify(hdfsService).parseFileAndClose(any(), any())
    result shouldBe true
  }

  it should "return true if the checkpoints offset does not contain the topic" in {
    val config = DefaultTestSparkConfig().copy(additionalConfs =
      Map(
        "spark.yarn.keytab" -> "/path/to/keytab",
        "spark.yarn.principal" -> "principal"
      )
    )
    val underTest = new HyperdriveOffsetComparisonServiceImpl(config.yarn, hdfsService, kafkaService)
    val jobDefinition = ResolvedJobDefinition(
      "job",
      SparkInstanceParameters(
        jobType = JobTypes.Hyperdrive,
        jobJar = "job.jar",
        mainClass = "mainClass",
        appArguments = List(
          "reader.kafka.topic=some-topic",
          "reader.kafka.brokers=http://localhost:9092",
          "writer.common.checkpoint.location=/checkpoint/path/${reader.kafka.topic}"
        )
      ),
      order = 1
    )
    when(hdfsService.getLatestOffsetFilePath(any())).thenReturn(Some(("1", true)))
    when(hdfsService.parseFileAndClose(any(), any[Iterator[String] => Map[String, Map[Int, Long]]]()))
      .thenReturn(Option(Map("some-other-topic" -> Map(0 -> 21L))))

    val result = underTest.isNewJobInstanceRequired(jobDefinition)

    verify(hdfsService).getLatestOffsetFilePath(any())
    verify(hdfsService).parseFileAndClose(any(), any())
    verify(kafkaService, never()).getEndOffsets(any(), any())
    result shouldBe true
  }

  it should "return true if the kafka offsets and checkpoint offset do not have the same set of partitions" in {
    val config = DefaultTestSparkConfig().copy(additionalConfs =
      Map(
        "spark.yarn.keytab" -> "/path/to/keytab",
        "spark.yarn.principal" -> "principal"
      )
    )
    val underTest = new HyperdriveOffsetComparisonServiceImpl(config.yarn, hdfsService, kafkaService)
    val jobDefinition = ResolvedJobDefinition(
      "job",
      SparkInstanceParameters(
        jobType = JobTypes.Hyperdrive,
        jobJar = "job.jar",
        mainClass = "mainClass",
        appArguments = List(
          "reader.kafka.topic=some-topic",
          "reader.kafka.brokers=http://localhost:9092",
          "writer.common.checkpoint.location=/checkpoint/path/${reader.kafka.topic}"
        )
      ),
      order = 1
    )

    when(hdfsService.getLatestOffsetFilePath(any())).thenReturn(Some(("1", true)))
    when(hdfsService.parseFileAndClose(any(), any[Iterator[String] => Map[String, Map[Int, Long]]]()))
      .thenReturn(Option(Map("some-topic" -> Map(0 -> 21L))))
    when(kafkaService.getEndOffsets(any(), any())).thenReturn(Map(0 -> 21L, 1 -> 1021L, 2 -> 2021L))

    val result = underTest.isNewJobInstanceRequired(jobDefinition)

    verify(hdfsService).getLatestOffsetFilePath(any())
    verify(hdfsService).parseFileAndClose(any(), any())
    verify(kafkaService).getEndOffsets(any(), any())
    result shouldBe true
  }

  it should "return true if the kafka offsets and checkpoint offsets are not the same" in {
    val config = DefaultTestSparkConfig().copy(additionalConfs =
      Map(
        "spark.yarn.keytab" -> "/path/to/keytab",
        "spark.yarn.principal" -> "principal"
      )
    )
    val underTest = new HyperdriveOffsetComparisonServiceImpl(config.yarn, hdfsService, kafkaService)
    val jobDefinition = ResolvedJobDefinition(
      "job",
      SparkInstanceParameters(
        jobType = JobTypes.Hyperdrive,
        jobJar = "job.jar",
        mainClass = "mainClass",
        appArguments = List(
          "reader.kafka.topic=some-topic",
          "reader.kafka.brokers=http://localhost:9092",
          "writer.common.checkpoint.location=/checkpoint/path/${reader.kafka.topic}"
        )
      ),
      order = 1
    )

    when(hdfsService.getLatestOffsetFilePath(any())).thenReturn(Some(("1", true)))
    when(hdfsService.parseFileAndClose(any(), any[Iterator[String] => Map[String, Map[Int, Long]]]()))
      .thenReturn(Option(Map("some-topic" -> Map(0 -> 42L, 1 -> 55L))))
    when(kafkaService.getEndOffsets(any(), any())).thenReturn(Map(0 -> 42L, 1 -> 7L))

    val result = underTest.isNewJobInstanceRequired(jobDefinition)

    verify(hdfsService).getLatestOffsetFilePath(any())
    verify(hdfsService).parseFileAndClose(any(), any())
    verify(kafkaService).getEndOffsets(any(), any())
    result shouldBe true
  }
}
