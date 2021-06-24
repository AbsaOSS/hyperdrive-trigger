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

import java.util.concurrent.CompletableFuture
import za.co.absa.hyperdrive.trigger.api.rest.services.JobInstanceService
import za.co.absa.hyperdrive.trigger.models.JobInstance
import javax.inject.Inject
import org.springframework.web.bind.annotation._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.compat.java8.FutureConverters._

@RestController
class JobInstanceController @Inject()(jobInstanceService: JobInstanceService) {

  @GetMapping(path = Array("/jobInstances"))
  def getJobInstances(@RequestParam dagInstanceId: Long): CompletableFuture[Seq[JobInstance]] = {
    jobInstanceService.getJobInstances(dagInstanceId).toJava.toCompletableFuture
  }

  @PostMapping(path = Array("/jobInstances/{applicationId}/kill"))
  def killJob(@PathVariable applicationId: String): CompletableFuture[Boolean] = {
    jobInstanceService.killJob(applicationId).toJava.toCompletableFuture
  }

}

