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

import org.apache.hadoop.fs
import org.apache.hadoop.fs.FileStatus
import org.apache.hadoop.security.UserGroupInformation
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.{reset, verify, when}
import org.mockito.invocation.InvocationOnMock
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{BeforeAndAfter, FlatSpec, Matchers}

import scala.util.{Failure, Try}

class CheckpointServiceTest extends FlatSpec with Matchers with BeforeAndAfter with MockitoSugar {
  private val hdfsService = mock[HdfsService]
  private val ugi = mock[UserGroupInformation]
  private val underTest = new CheckpointServiceImpl(hdfsService)

  before {
    reset(hdfsService)
  }

  "getOffsetFromFile" should "return None if parsing failed" in {
    when(hdfsService.parseFileAndClose(any(), any())(any())).thenReturn(Try(None))

    val result = underTest.getOffsetsFromFile("non-existent")(ugi)

    result shouldBe Try(None)
  }

  it should "return the parsed contents" in {
    val offsets = Map(
      "topic" -> Map(0 -> 1000L)
    )
    when(hdfsService.parseFileAndClose[underTest.TopicPartitionOffsets](any(), any())(any()))
      .thenReturn(Try(Some(offsets)))

    val result = underTest.getOffsetsFromFile("any")(ugi)

    result shouldBe Try(Some(offsets))
  }

  it should "parse an offset file" in {
    underTest.getOffsetsFromFile("any")(ugi)
    val fnCaptor: ArgumentCaptor[Iterator[String] => underTest.TopicPartitionOffsets] =
      ArgumentCaptor.forClass(classOf[Iterator[String] => underTest.TopicPartitionOffsets])
    verify(hdfsService).parseFileAndClose(any(), fnCaptor.capture())(any())
    val parseFn = fnCaptor.getValue
    val lines = Seq(
      "v1",
      raw"""{"batchWatermarkMs":0,"batchTimestampMs":1633360640176}""",
      raw"""{"my.topic":{"2":2021,"1":1021,"3":3021,"0":21}, "my.other.topic":{"0":0}}"""
    ).toIterator

    val result = parseFn.apply(lines)

    result.size shouldBe 2
    result.head._1 shouldBe "my.topic"
    result.head._2 should contain theSameElementsAs Map("2" -> 2021, "1" -> 1021, "3" -> 3021, "0" -> 21)
    result.toSeq(1)._1 shouldBe "my.other.topic"
    result.toSeq(1)._2 should contain theSameElementsAs Map("0" -> 0)
  }

  "getLatestOffsetFile" should "get the latest offset file, and it is committed" in {
    when(hdfsService.exists(any())(any())).thenReturn(Try(true))
    when(hdfsService.listStatus(any(), any())(any())).thenReturn(Try(createOffsetFiles(12)))
    val params = getHdfsParameters

    val resultTryOpt = underTest.getLatestOffsetFilePath(params)(ugi)

    resultTryOpt.isSuccess shouldBe true
    resultTryOpt.get.isDefined shouldBe true
    val result = resultTryOpt.get.get
    result._1 shouldBe s"/checkpoints/offsets/12"
    result._2 shouldBe true
  }

  it should "get the latest offset file, and committed = false, if the commits folder is empty" in {
    when(hdfsService.exists(any())(any())).thenReturn(Try(true))
    when(hdfsService.listStatus(any(), any())(any())).thenAnswer((invocation: InvocationOnMock) => {
      val path = invocation.getArgument[fs.Path](0)
      if (path.toString.contains("offsets")) {
        Try(createOffsetFiles(12))
      } else {
        Try(Array[FileStatus]())
      }
    })
    val params = getHdfsParameters

    val resultTryOpt = underTest.getLatestOffsetFilePath(params)(ugi)

    resultTryOpt.isSuccess shouldBe true
    resultTryOpt.get.isDefined shouldBe true
    val result = resultTryOpt.get.get
    result._1 shouldBe "/checkpoints/offsets/12"
    result._2 shouldBe false
  }

  it should "get the latest offset file, and it is not committed" in {
    when(hdfsService.exists(any())(any())).thenReturn(Try(true))
    when(hdfsService.listStatus(any(), any())(any())).thenAnswer((invocation: InvocationOnMock) => {
      val path = invocation.getArgument[fs.Path](0)
      if (path.toString.contains("offsets")) {
        Try(createOffsetFiles(12))
      } else {
        Try(createOffsetFiles(11))
      }
    })
    val params = getHdfsParameters

    val resultTryOpt = underTest.getLatestOffsetFilePath(params)(ugi)

    resultTryOpt.isSuccess shouldBe true
    resultTryOpt.get.isDefined shouldBe true
    val result = resultTryOpt.get.get
    result._1 shouldBe "/checkpoints/offsets/12"
    result._2 shouldBe false
  }

  it should "return None if the checkpoints folder does not exist" in {
    when(hdfsService.exists(any())(any())).thenReturn(Try(false))
    val params = getHdfsParameters

    val result = underTest.getLatestOffsetFilePath(params)(ugi)

    result.isSuccess shouldBe true
    result.get.isDefined shouldBe false
  }

  it should "return None if the offsets folder is empty" in {
    when(hdfsService.exists(any())(any())).thenReturn(Try(true))
    when(hdfsService.listStatus(any(), any())(any())).thenReturn(Try(Array[FileStatus]()))
    val params = getHdfsParameters

    val result = underTest.getLatestOffsetFilePath(params)(ugi)

    result.isSuccess shouldBe true
    result.get.isDefined shouldBe false
  }

  it should "return Failure if an exception occurred while accessing the file system" in {
    val params = getHdfsParameters
    when(hdfsService.exists(any())(any())).thenReturn(Failure(new RuntimeException("Failed")))

    val result = underTest.getLatestOffsetFilePath(params)(ugi)

    result.isFailure shouldBe true
  }

  private def createOffsetFiles(maxBatchId: Int) = {
    (0 to maxBatchId).map { i =>
      val fst = new FileStatus()
      fst.setPath(new fs.Path(s"abc/def/$i"))
      fst
    }
  }.toArray

  private def getHdfsParameters = {
    new HdfsParameters(
      keytab = "",
      principal = "",
      checkpointLocation = "/checkpoints"
    )
  }
}
