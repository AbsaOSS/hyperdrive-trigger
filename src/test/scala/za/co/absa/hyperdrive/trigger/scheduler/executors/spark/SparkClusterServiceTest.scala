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
import za.co.absa.hyperdrive.trigger.models.{JobInstance, SparkInstanceParameters}

import scala.concurrent.Future

class SparkClusterServiceTest extends FlatSpec with Matchers with SparkClusterService {

  override def submitJob(
    jobInstance: JobInstance,
    jobParameters: SparkInstanceParameters,
    updateJob: JobInstance => Future[Unit]
  ): Future[Unit] = Future.successful((): Unit)

  override def handleMissingYarnStatus(
    jobInstance: JobInstance,
    updateJob: JobInstance => Future[Unit]
  ): Future[Unit] = Future.successful((): Unit)

  "SparkClusterService.mergeAdditionalSparkConfig" should "merge empty inputs" in {
    val first = Map.empty[String, String]
    val second = Map.empty[String, String]

    val result = this.mergeAdditionalSparkConfig(first, second)

    result should contain theSameElementsAs Map(
      "spark.executor.extraJavaOptions" -> "",
      "spark.driver.extraJavaOptions" -> ""
    )
  }

  it should "concatenate the values if the key is extraJavaOptions" in {
    val first = Map(
      "spark.driver.extraJavaOptions" -> "-user.prop=userDriver",
      "spark.executor.extraJavaOptions" -> "-user.prop=userExecutor"
    )
    val second = Map(
      "spark.driver.extraJavaOptions" -> "-template.prop=templateDriver",
      "spark.executor.extraJavaOptions" -> "-template.prop=templateExecutor"
    )

    val result = this.mergeAdditionalSparkConfig(first, second)

    result should contain theSameElementsAs Map(
      "spark.driver.extraJavaOptions" -> "-user.prop=userDriver -template.prop=templateDriver",
      "spark.executor.extraJavaOptions" -> "-user.prop=userExecutor -template.prop=templateExecutor"
    )
  }

  it should "concatenate the values if the key is spark.yarn.tags" in {
    val first = Map(
      "spark.yarn.tags" -> "first,second,third"
    )
    val second = Map(
      "spark.yarn.tags" -> "third,first,fourth"
    )

    val result = this.mergeAdditionalSparkConfig(first, second)

    result should contain theSameElementsAs Map(
      "spark.yarn.tags" -> "first,second,third,fourth",
      "spark.driver.extraJavaOptions" -> "",
      "spark.executor.extraJavaOptions" -> ""
    )
  }

  it should "concatenate the values if the key is extraJavaOptions or spark.yarn.tags" in {
    val first = Map(
      "spark.driver.extraJavaOptions" -> "-user.prop=userDriver",
      "spark.executor.extraJavaOptions" -> "-user.prop=userExecutor",
      "spark.yarn.tags" -> "first,second,third"
    )
    val second = Map(
      "spark.driver.extraJavaOptions" -> "-template.prop=templateDriver",
      "spark.executor.extraJavaOptions" -> "-template.prop=templateExecutor",
      "spark.yarn.tags" -> "third,first,fourth"
    )

    val result = this.mergeAdditionalSparkConfig(first, second)

    result should contain theSameElementsAs Map(
      "spark.driver.extraJavaOptions" -> "-user.prop=userDriver -template.prop=templateDriver",
      "spark.executor.extraJavaOptions" -> "-user.prop=userExecutor -template.prop=templateExecutor",
      "spark.yarn.tags" -> "first,second,third,fourth"
    )
  }
}
