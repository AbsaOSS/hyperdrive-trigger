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

package za.co.absa.hyperdrive.trigger.api.rest.controllers

import org.springframework.beans.factory.annotation.Value
import org.springframework.web.bind.annotation._
import za.co.absa.hyperdrive.trigger.models.AppInfo

@RestController 
class AppInfoController {
  @Value("${environment:Unknown}")
  val environment: String = ""
  @Value("${version:Unknown}")
  val version: String = ""
  @Value("${sparkYarnSink.hadoopResourceManagerUrlBase:Unknown}")
  val resourceManagerUrl: String = ""

  @GetMapping(path = Array("/app/info"))
  def appInfo(): AppInfo = {
    AppInfo(
      environment = environment,
      version = version,
      resourceManagerUrl = resourceManagerUrl
    )
  }

}
