
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

import org.springframework.stereotype.Component
import za.co.absa.hyperdrive.trigger.configuration.application.SparkConfig

import java.util.concurrent
import javax.inject.Inject
import scala.concurrent.ExecutionContext

@Component
class DefaultSparkClusterServiceExecutionContextProvider @Inject()(val sparkConfig: SparkConfig)
  extends SparkClusterServiceExecutionContextProvider {
  lazy val executionContext: ExecutionContext =
    ExecutionContext.fromExecutor(concurrent.Executors.newFixedThreadPool(sparkConfig.sparkSubmitThreadPoolSize))

  override def get(): ExecutionContext = executionContext
}
