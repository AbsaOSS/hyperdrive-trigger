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
import org.scalatest.{AsyncFlatSpec, BeforeAndAfter, Matchers}
import za.co.absa.hyperdrive.trigger.configuration.application.DefaultTestSparkConfig
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes
import za.co.absa.hyperdrive.trigger.models.{ShellInstanceParameters, SparkInstanceParameters}

class HyperdriveOffsetComparisonServiceTest extends AsyncFlatSpec with Matchers with BeforeAndAfter with MockitoSugar {
  private val checkpointService = mock[CheckpointService]
  private val kafkaService = mock[KafkaService]
  private val underTest =
    new HyperdriveOffsetComparisonServiceImpl(DefaultTestSparkConfig().yarn, checkpointService, kafkaService)

  before {
    reset(checkpointService)
    reset(kafkaService)
  }

  "isNewJobInstanceRequired" should "return false if the kafka and checkpoint folder offsets are the same" in {
    val config = getSparkConfig
    val underTest = new HyperdriveOffsetComparisonServiceImpl(config.yarn, checkpointService, kafkaService)
    val jobParameters = getJobParameters

    when(checkpointService.getLatestOffsetFilePath(any()))
      .thenReturn(Some(("/checkpoint/path/some-topic/offsets/21", true)))
    when(checkpointService.getOffsetsFromFile(any()))
      .thenReturn(Option(Map("some-topic" -> Map(2 -> 2021L, 0 -> 21L, 1 -> 1021L))))
    when(kafkaService.getBeginningOffsets(any(), any())).thenReturn(Map(0 -> 0L, 1 -> 1L, 2 -> 2L))
    when(kafkaService.getEndOffsets(any(), any())).thenReturn(Map(0 -> 21L, 1 -> 1021L, 2 -> 2021L))

    val resultFut = underTest.isNewJobInstanceRequired(jobParameters)

    resultFut.map { result =>
      val hdfsParametersCaptor: ArgumentCaptor[HdfsParameters] = ArgumentCaptor.forClass(classOf[HdfsParameters])
      verify(checkpointService).getLatestOffsetFilePath(hdfsParametersCaptor.capture())
      hdfsParametersCaptor.getValue.keytab shouldBe "/path/to/keytab"
      hdfsParametersCaptor.getValue.principal shouldBe "principal"
      hdfsParametersCaptor.getValue.checkpointLocation shouldBe "/checkpoint/path/some-topic"
      verify(checkpointService).getOffsetsFromFile(eqTo("/checkpoint/path/some-topic/offsets/21"))
      verify(kafkaService).getEndOffsets(eqTo("some-topic"), any())
      result shouldBe false
    }
  }

  it should "return true if the job type is not hyperdrive" in {
    val jobParameters = getJobParameters.copy(jobType = JobTypes.Spark)

    val resultFut = underTest.isNewJobInstanceRequired(jobParameters)

    resultFut.map { result =>
      verify(checkpointService, never()).getLatestOffsetFilePath(any())
      verify(checkpointService, never()).getOffsetsFromFile(any())
      verify(kafkaService, never()).getEndOffsets(any(), any())
      result shouldBe true
    }
  }

  it should "return true if the topic is not in the app arguments" in {
    val jobParameters = getJobParameters.copy(appArguments = List("reader.kafka.brokers=http://localhost:9092"))

    val resultFut = underTest.isNewJobInstanceRequired(jobParameters)

    resultFut.map { result =>
      verify(checkpointService, never()).getLatestOffsetFilePath(any())
      verify(checkpointService, never()).getOffsetsFromFile(any())
      verify(kafkaService, never()).getEndOffsets(any(), any())
      result shouldBe true
    }
  }

  it should "return true if the kafka brokers are not in the app arguments" in {
    val jobParameters = getJobParameters.copy(appArguments = List("reader.kafka.topic=my-topic"))

    val resultFut = underTest.isNewJobInstanceRequired(jobParameters)

    resultFut.map { result =>
      verify(checkpointService, never()).getLatestOffsetFilePath(any())
      verify(checkpointService, never()).getOffsetsFromFile(any())
      verify(kafkaService, never()).getEndOffsets(any(), any())
      result shouldBe true
    }
  }

  it should "return true if the jobParameters are not SparkInstanceParameters" in {
    val jobParameters = ShellInstanceParameters(
      jobType = JobTypes.Hyperdrive,
      scriptLocation = "script.sh"
    )

    val resultFut = underTest.isNewJobInstanceRequired(jobParameters)

    resultFut.map { result =>
      verify(checkpointService, never()).getLatestOffsetFilePath(any())
      verify(checkpointService, never()).getOffsetsFromFile(any())
      verify(kafkaService, never()).getEndOffsets(any(), any())
      result shouldBe true
    }
  }

  it should "return false if the kafka topic does not exist" in {
    val config = getSparkConfig
    val underTest = new HyperdriveOffsetComparisonServiceImpl(config.yarn, checkpointService, kafkaService)
    val jobParameters = getJobParameters

    when(kafkaService.getBeginningOffsets(any(), any())).thenReturn(Map[Int, Long]())
    when(kafkaService.getEndOffsets(any(), any())).thenReturn(Map[Int, Long]())

    val resultFut = underTest.isNewJobInstanceRequired(jobParameters)

    resultFut.map { result =>
      verify(checkpointService, never()).getLatestOffsetFilePath(any())
      result shouldBe false
    }
  }

  it should "return false if the kafka topic is empty" in {
    val config = getSparkConfig
    val underTest = new HyperdriveOffsetComparisonServiceImpl(config.yarn, checkpointService, kafkaService)
    val jobParameters = getJobParameters

    when(kafkaService.getBeginningOffsets(any(), any())).thenReturn(Map(0 -> 21L, 1 -> 42L))
    when(kafkaService.getEndOffsets(any(), any())).thenReturn(Map(0 -> 21L, 1 -> 42L))

    val resultFut = underTest.isNewJobInstanceRequired(jobParameters)

    resultFut.map { result =>
      verify(checkpointService, never()).getLatestOffsetFilePath(any())
      result shouldBe false
    }
  }

  it should "return true if no offset file is present" in {
    val config = getSparkConfig
    val underTest = new HyperdriveOffsetComparisonServiceImpl(config.yarn, checkpointService, kafkaService)
    val jobParameters = getJobParameters

    when(kafkaService.getBeginningOffsets(any(), any())).thenReturn(Map(0 -> 0L))
    when(kafkaService.getEndOffsets(any(), any())).thenReturn(Map(0 -> 100L))
    when(checkpointService.getLatestOffsetFilePath(any())).thenReturn(None)

    val resultFut = underTest.isNewJobInstanceRequired(jobParameters)

    resultFut.map { result =>
      verify(checkpointService).getLatestOffsetFilePath(any())
      result shouldBe true
    }
  }

  it should "return true if the offset is not committed" in {
    val config = getSparkConfig
    val underTest = new HyperdriveOffsetComparisonServiceImpl(config.yarn, checkpointService, kafkaService)
    val jobParameters = getJobParameters

    when(kafkaService.getBeginningOffsets(any(), any())).thenReturn(Map(0 -> 0L))
    when(kafkaService.getEndOffsets(any(), any())).thenReturn(Map(0 -> 100L))
    when(checkpointService.getLatestOffsetFilePath(any())).thenReturn(Some(("1", false)))

    val resultFut = underTest.isNewJobInstanceRequired(jobParameters)

    resultFut.map { result =>
      verify(checkpointService).getLatestOffsetFilePath(any())
      result shouldBe true
    }
  }

  it should "return true if a offset file could not be parsed" in {
    val config = getSparkConfig
    val underTest = new HyperdriveOffsetComparisonServiceImpl(config.yarn, checkpointService, kafkaService)
    val jobParameters = getJobParameters

    when(kafkaService.getBeginningOffsets(any(), any())).thenReturn(Map(0 -> 0L))
    when(kafkaService.getEndOffsets(any(), any())).thenReturn(Map(0 -> 100L))
    when(checkpointService.getLatestOffsetFilePath(any())).thenReturn(Some(("1", true)))
    when(checkpointService.getOffsetsFromFile(any()))
      .thenThrow(new RuntimeException("Failed to parse"))

    val resultFut = underTest.isNewJobInstanceRequired(jobParameters)

    resultFut.map { result =>
      verify(checkpointService).getLatestOffsetFilePath(any())
      verify(checkpointService).getOffsetsFromFile(any())
      result shouldBe true
    }
  }

  it should "return true if the checkpoints offset does not contain the topic" in {
    val config = getSparkConfig
    val underTest = new HyperdriveOffsetComparisonServiceImpl(config.yarn, checkpointService, kafkaService)
    val jobParameters = getJobParameters

    when(kafkaService.getBeginningOffsets(any(), any())).thenReturn(Map(0 -> 0L))
    when(kafkaService.getEndOffsets(any(), any())).thenReturn(Map(0 -> 100L))
    when(checkpointService.getLatestOffsetFilePath(any())).thenReturn(Some(("1", true)))
    when(checkpointService.getOffsetsFromFile(any()))
      .thenReturn(Option(Map("some-other-topic" -> Map(0 -> 21L))))

    val resultFut = underTest.isNewJobInstanceRequired(jobParameters)

    resultFut.map { result =>
      verify(checkpointService).getLatestOffsetFilePath(any())
      verify(checkpointService).getOffsetsFromFile(any())
      result shouldBe true
    }
  }

  it should "return true if the kafka offsets and checkpoint offset do not have the same set of partitions" in {
    val config = getSparkConfig
    val underTest = new HyperdriveOffsetComparisonServiceImpl(config.yarn, checkpointService, kafkaService)
    val jobParameters = getJobParameters

    when(checkpointService.getLatestOffsetFilePath(any())).thenReturn(Some(("1", true)))
    when(checkpointService.getOffsetsFromFile(any()))
      .thenReturn(Option(Map("some-topic" -> Map(0 -> 21L))))
    when(kafkaService.getBeginningOffsets(any(), any())).thenReturn(Map(0 -> 0L, 1 -> 1L, 2 -> 2L))
    when(kafkaService.getEndOffsets(any(), any())).thenReturn(Map(0 -> 21L, 1 -> 1021L, 2 -> 2021L))

    val resultFut = underTest.isNewJobInstanceRequired(jobParameters)

    resultFut.map { result =>
      verify(checkpointService).getLatestOffsetFilePath(any())
      verify(checkpointService).getOffsetsFromFile(any())
      verify(kafkaService).getEndOffsets(any(), any())
      result shouldBe true
    }
  }

  it should "return true if the kafka offsets and checkpoint offsets are not the same" in {
    val config = getSparkConfig
    val underTest = new HyperdriveOffsetComparisonServiceImpl(config.yarn, checkpointService, kafkaService)
    val jobParameters = getJobParameters

    when(checkpointService.getLatestOffsetFilePath(any())).thenReturn(Some(("1", true)))
    when(checkpointService.getOffsetsFromFile(any()))
      .thenReturn(Option(Map("some-topic" -> Map(0 -> 42L, 1 -> 55L))))
    when(kafkaService.getBeginningOffsets(any(), any())).thenReturn(Map(0 -> 0L, 1 -> 0L))
    when(kafkaService.getEndOffsets(any(), any())).thenReturn(Map(0 -> 42L, 1 -> 7L))

    val resultFut = underTest.isNewJobInstanceRequired(jobParameters)

    resultFut.map { result =>
      verify(checkpointService).getLatestOffsetFilePath(any())
      verify(checkpointService).getOffsetsFromFile(any())
      verify(kafkaService).getEndOffsets(any(), any())
      result shouldBe true
    }
  }

  private def getSparkConfig =
    DefaultTestSparkConfig().copy(additionalConfs =
      Map(
        "spark.yarn.keytab" -> "/path/to/keytab",
        "spark.yarn.principal" -> "principal"
      )
    )

  private def getJobParameters = {
    SparkInstanceParameters(
      jobType = JobTypes.Hyperdrive,
      jobJar = "job.jar",
      mainClass = "mainClass",
      appArguments = List(
        "reader.kafka.topic=some-topic",
        "reader.kafka.brokers=http://localhost:9092",
        "writer.common.checkpoint.location=/checkpoint/path/${reader.kafka.topic}"
      )
    )
  }
}
