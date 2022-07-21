
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

import org.apache.hadoop.security.UserGroupInformation
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{BeforeAndAfter, FlatSpec, Matchers}
import za.co.absa.commons.io.TempDirectory

import java.nio.file.{Files, Path}

class HdfsServiceTest extends FlatSpec with BeforeAndAfter with Matchers with MockitoSugar {

  private val underTest = new HdfsServiceImpl
  private val ugi = UserGroupInformation.getCurrentUser

  private var baseDir: TempDirectory = _
  private var baseDirPath: Path = _

  before {
    baseDir = TempDirectory("HdfsServiceTest").deleteOnExit()
    baseDirPath = baseDir.path.toAbsolutePath
  }

  after {
    baseDir.delete()
  }

  "parseFileAndClose" should "parse an offset file" in {
    val tmpFile = Files.createTempFile(baseDirPath, "parseFileAndClose", ".txt")
    val parseFn: Iterator[String] => Int = (_: Iterator[String]) => 42

    val resultTryOpt = underTest.parseFileAndClose(tmpFile.toAbsolutePath.toString, parseFn)(ugi)

    resultTryOpt.isSuccess shouldBe true
    resultTryOpt.get.isDefined shouldBe true
    val result = resultTryOpt.get.get
    result shouldBe 42
  }

  it should "return Failure if an exception occurred while accessing the file system" in {
    val parseFn: Iterator[String] => Int = (_: Iterator[String]) => 42

    val result = underTest.parseFileAndClose("", parseFn)(ugi)

    result.isFailure shouldBe true
  }

  it should "return Failure if parsing throws an error" in {
    val tmpFile = Files.createTempFile(baseDirPath, "hdfs-service-test", ".txt")
    val parseFn: Iterator[String] => Int = (_: Iterator[String]) => throw new RuntimeException("Failed parsing")
    val result = underTest.parseFileAndClose(tmpFile.toAbsolutePath.toString, parseFn)(ugi)

    result.isFailure shouldBe true
    result.failed.get.getMessage should include("hdfs-service-test")
  }
}
