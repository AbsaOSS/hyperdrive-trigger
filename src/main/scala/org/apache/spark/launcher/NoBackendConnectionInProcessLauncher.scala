
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

package org.apache.spark.launcher

import org.slf4j.LoggerFactory

class NoBackendConnectionInProcessLauncher extends InProcessLauncher {

  private val logger = LoggerFactory.getLogger(this.getClass)
  override def startApplication(listeners: SparkAppHandle.Listener*): SparkAppHandle = {
    import scala.collection.JavaConverters._
    if (builder.isClientMode(Map[String, String]().asJava)) {
      logger.warn("It's not recommended to run client-mode applications using InProcessLauncher.")
    }
    val main = findSparkSubmit()
    val server = LauncherServer.getOrCreateServer()

    val handle = new InProcessAppHandle(server)
    listeners.foreach(handle.addListener)

    builder.conf.remove(LauncherProtocol.CONF_LAUNCHER_PORT)
    builder.conf.remove(LauncherProtocol.CONF_LAUNCHER_SECRET)
    setConf("spark.yarn.submit.waitAppCompletion", "false")

    val sparkArgs = builder.buildSparkSubmitArgs().asScala.toArray
    val appName = CommandBuilderUtils.firstNonEmpty(builder.appName, builder.mainClass, "<unknown>")
    handle.start(appName, main, sparkArgs)
    handle
  }
}
