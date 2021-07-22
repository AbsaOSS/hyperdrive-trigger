
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

package za.co.absa.hyperdrive.trigger.configuration.application

import java.time.Duration

object TestSchedulerConfig {
  def apply(
    heartBeat: Int = 5000,
    maxParallelJobs: Int = 10,
    autostart: Boolean = true,
    lagThreshold: Duration = Duration.ofSeconds(20L),
    sensorsThreadPoolSize: Int = 20,
    sensorsChangedSensorsChunkQuerySize: Int = 100,
    executorsThreadPoolSize: Int = 30
  ): SchedulerConfig = {
    new SchedulerConfig(
      heartBeat, maxParallelJobs, autostart, lagThreshold,
      new Sensors(sensorsThreadPoolSize, sensorsChangedSensorsChunkQuerySize),
      new Executors(executorsThreadPoolSize)
    )
  }
}
