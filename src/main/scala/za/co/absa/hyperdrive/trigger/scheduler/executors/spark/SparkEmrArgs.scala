
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

case class SparkEmrArgs (
  mainClass: String,
  jobJar: String,
  appName: String,
  confs: Map[String, String],
  files: Seq[String],
  additionalJars: Seq[String],
  sparkArgs: Seq[String],
  appArgs: Seq[String]
) {
  def getArgs: Seq[String] = {
    val filesArgs = if (files.nonEmpty) Seq("--files", files.mkString(",")) else Seq()
    val jarsArgs = if (additionalJars.nonEmpty) Seq("--jars", additionalJars.mkString(",")) else Seq()
    Seq("spark-submit") ++
      confs.flatMap {
        case (key, value) => Seq("--conf", s"$key=$value")
      } ++
      Seq("--class", mainClass) ++
      Seq("--name", appName) ++
      filesArgs ++
      jarsArgs ++
      sparkArgs ++
      Seq(jobJar) ++
      appArgs
  }
}
