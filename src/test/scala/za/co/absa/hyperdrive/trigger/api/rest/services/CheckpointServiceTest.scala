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

import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.doNothing
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{BeforeAndAfter, FlatSpec, Matchers}
import za.co.absa.commons.io.TempDirectory

import java.nio.charset.StandardCharsets
import java.nio.file.{Files, Path}

class CheckpointServiceTest extends FlatSpec with Matchers with BeforeAndAfter with MockitoSugar {
  private val ugiWrapper = mock[UserGroupInformationWrapper]
  doNothing().when(ugiWrapper).loginUserFromKeytab(any(), any())
  private val underTest = new CheckpointServiceImpl(ugiWrapper)
  private var baseDir: TempDirectory = _
  private var baseDirPath: Path = _

  before {
    baseDir = TempDirectory("HdfsServiceTest").deleteOnExit()
    baseDirPath = baseDir.path.toAbsolutePath
  }

  after {
    baseDir.delete()
  }

  "getOffsetFromFile" should "return None if the file does not exist" in {
    val result = underTest.getOffsetsFromFile("non-existent")

    result shouldBe None
  }

  it should "throw an exception if parsing throws an error" in {
    val tmpFile = Files.createTempFile(baseDirPath, "hdfsServiceTest", "")

    val result = the[Exception] thrownBy underTest.getOffsetsFromFile(tmpFile.toAbsolutePath.toString)

    result.getMessage should include(tmpFile.toAbsolutePath.toString)
  }

  it should "parse an offset file" in {
    val tmpFile = Files.createTempFile(baseDirPath, "hdfsServiceTest", "")
    val lines = Seq(
      "v1",
      raw"""{"batchWatermarkMs":0,"batchTimestampMs":1633360640176}""",
      raw"""{"my.topic":{"2":2021,"1":1021,"3":3021,"0":21}, "my.other.topic":{"0":0}}"""
    ).mkString("\n")
    Files.write(tmpFile, lines.getBytes(StandardCharsets.UTF_8))

    val resultOpt = underTest.getOffsetsFromFile(tmpFile.toAbsolutePath.toString)

    resultOpt.isDefined shouldBe true
    val result = resultOpt.get
    result.size shouldBe 2
    result.head._1 shouldBe "my.topic"
    result.head._2 should contain theSameElementsAs Map("2" -> 2021, "1" -> 1021, "3" -> 3021, "0" -> 21)
    result.toSeq(1)._1 shouldBe "my.other.topic"
    result.toSeq(1)._2 should contain theSameElementsAs Map("0" -> 0)
  }

  "getLatestOffsetFile" should "get the latest offset file, and it is committed" in {
    val tmpCheckpointDir = Files.createTempDirectory(baseDirPath, "checkpoints")
    createOffsetFile(tmpCheckpointDir, 12)
    createCommitFile(tmpCheckpointDir, 12)

    val params = new HdfsParameters(
      keytab = "",
      principal = "",
      checkpointLocation = tmpCheckpointDir.toAbsolutePath.toString
    )

    val result = underTest.getLatestOffsetFilePath(params)

    result.isDefined shouldBe true
    result.get._1 shouldBe s"${tmpCheckpointDir.toAbsolutePath.toString}/offsets/12"
    result.get._2 shouldBe true
  }

  it should "get the latest offset file, and committed = true, if the commits folder is empty" in {
    val tmpCheckpointDir = Files.createTempDirectory(baseDirPath, "checkpoints")
    createOffsetFile(tmpCheckpointDir, 12)
    Files.createDirectory(tmpCheckpointDir.resolve("commits"))

    val params = new HdfsParameters(
      keytab = "",
      principal = "",
      checkpointLocation = tmpCheckpointDir.toAbsolutePath.toString
    )

    val result = underTest.getLatestOffsetFilePath(params)

    result.isDefined shouldBe true
    result.get._1 shouldBe s"${tmpCheckpointDir.toAbsolutePath.toString}/offsets/12"
    result.get._2 shouldBe false
  }

  it should "get the latest offset file, and it is not committed" in {
    val tmpCheckpointDir = Files.createTempDirectory(baseDirPath, "checkpoints")
    createOffsetFile(tmpCheckpointDir, 12)
    createCommitFile(tmpCheckpointDir, 11)

    val params = new HdfsParameters(
      keytab = "",
      principal = "",
      checkpointLocation = tmpCheckpointDir.toAbsolutePath.toString
    )

    val result = underTest.getLatestOffsetFilePath(params)

    result.isDefined shouldBe true
    result.get._1 shouldBe s"${tmpCheckpointDir.toAbsolutePath.toString}/offsets/12"
    result.get._2 shouldBe false
  }

  it should "return None if the checkpoints folder does not exist" in {
    val params = new HdfsParameters(
      keytab = "",
      principal = "",
      checkpointLocation = "non-existent"
    )

    val result = underTest.getLatestOffsetFilePath(params)

    result.isDefined shouldBe false
  }

  it should "return None if the offsets folder is empty" in {
    val params = new HdfsParameters(
      keytab = "",
      principal = "",
      checkpointLocation = "checkpoints"
    )
    Files.createTempDirectory(baseDirPath, "checkpoints")

    val result = underTest.getLatestOffsetFilePath(params)

    result.isDefined shouldBe false
  }

  private def createOffsetFile(checkpointDir: Path, batchId: Int) = {
    val tmpCommitsDir = Files.createDirectory(checkpointDir.resolve("offsets"))
    (0 to batchId).map(i => Files.createFile(tmpCommitsDir.resolve(s"$i")))
  }

  private def createCommitFile(checkpointDir: Path, batchId: Int) = {
    val tmpCommitsDir = Files.createDirectory(checkpointDir.resolve("commits"))
    (0 to batchId).map(i => Files.createFile(tmpCommitsDir.resolve(s"$i")))
  }
}
