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

package za.co.absa.hyperdrive.trigger.scheduler.executors.spark

import org.scalatest.{FlatSpec, Matchers}

class SparkEmrArgsTest extends FlatSpec with Matchers {

  "SparkEmrArgs.getArgs" should "return the spark args as a string sequence" in {
    val sparkEmrArgs = SparkEmrArgs(
      mainClass = "mainClass",
      jobJar = "////job.jar",
      appName = "appName",
      sparkSubmitConfs = Map("--spark-submit-conf" -> "some-value"),
      confs = Map("conf1" -> "value1", "conf2" -> "value2"),
      files = Seq("file1", "file2", "file3"),
      additionalJars = Seq("1.jar", "2.jar"),
      sparkArgs = Seq("--sparkArg1", "--sparkArg2"),
      appArgs = Seq("arg1", "arg2", "arg3")
    )

    val result = sparkEmrArgs.getArgs

    result should contain theSameElementsInOrderAs Seq(
      "spark-submit",
      "--spark-submit-conf",
      "some-value",
      "--conf",
      "conf1=value1",
      "--conf",
      "conf2=value2",
      "--class",
      "mainClass",
      "--name",
      "appName",
      "--files",
      "file1,file2,file3",
      "--jars",
      "1.jar,2.jar",
      "--sparkArg1",
      "--sparkArg2",
      "////job.jar",
      "arg1",
      "arg2",
      "arg3"
    )
  }

  it should "not provide arguments for empty sequences" in {
    val sparkEmrArgs = SparkEmrArgs(
      mainClass = "mainClass",
      jobJar = "job.jar",
      appName = "appName",
      sparkSubmitConfs = Map(),
      confs = Map(),
      files = Seq(),
      additionalJars = Seq(),
      sparkArgs = Seq(),
      appArgs = Seq()
    )

    val result = sparkEmrArgs.getArgs

    result should contain theSameElementsInOrderAs Seq(
      "spark-submit",
      "--class",
      "mainClass",
      "--name",
      "appName",
      "job.jar"
    )
  }
}
