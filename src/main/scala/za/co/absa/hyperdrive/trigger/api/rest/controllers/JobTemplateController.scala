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
import javax.inject.Inject
import org.springframework.web.bind.annotation._
import za.co.absa.hyperdrive.trigger.api.rest.services.JobTemplateService
import za.co.absa.hyperdrive.trigger.models.{JobTemplate, Workflow}
import za.co.absa.hyperdrive.trigger.models.search.{TableSearchRequest, TableSearchResponse}

import scala.compat.java8.FutureConverters._
import scala.concurrent.ExecutionContext.Implicits.global

@RestController
class JobTemplateController @Inject() (jobTemplateService: JobTemplateService) {

  @GetMapping(path = Array("/jobTemplate"))
  def getJobTemplate(@RequestParam id: Long): CompletableFuture[JobTemplate] =
    jobTemplateService.getJobTemplate(id).toJava.toCompletableFuture

  @GetMapping(path = Array("/jobTemplates"))
  def getJobTemplates: CompletableFuture[Seq[JobTemplate]] =
    jobTemplateService.getJobTemplates().toJava.toCompletableFuture

  @PostMapping(path = Array("/jobTemplates/search"))
  def searchJobTemplates(
    @RequestBody searchRequest: TableSearchRequest
  ): CompletableFuture[TableSearchResponse[JobTemplate]] =
    jobTemplateService.searchJobTemplates(searchRequest).toJava.toCompletableFuture

  @PutMapping(path = Array("/jobTemplate"))
  def createJobTemplate(@RequestBody jobTemplate: JobTemplate): CompletableFuture[JobTemplate] =
    jobTemplateService.createJobTemplate(jobTemplate).toJava.toCompletableFuture

  @PostMapping(path = Array("/jobTemplates"))
  def updateJobTemplate(@RequestBody jobTemplate: JobTemplate): CompletableFuture[JobTemplate] =
    jobTemplateService.updateJobTemplate(jobTemplate).toJava.toCompletableFuture

  @DeleteMapping(path = Array("/jobTemplates"))
  def deleteJobTemplate(@RequestParam id: Long): CompletableFuture[Boolean] =
    jobTemplateService.deleteJobTemplate(id).toJava.toCompletableFuture

  @GetMapping(path = Array("/jobTemplates/{id}/workflows"))
  def getWorkflowsByJobTemplate(@PathVariable id: Long): CompletableFuture[Seq[Workflow]] =
    jobTemplateService.getWorkflowsByJobTemplate(id).toJava.toCompletableFuture
}
