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
import org.springframework.core.io.ByteArrayResource
import org.springframework.http.{HttpHeaders, MediaType, ResponseEntity}
import org.springframework.web.bind.annotation._
import org.springframework.web.multipart.MultipartFile
import za.co.absa.hyperdrive.trigger.ObjectMapperSingleton
import za.co.absa.hyperdrive.trigger.api.rest.services.WorkflowService
import za.co.absa.hyperdrive.trigger.models.errors.{ApiError, ApiException}
import za.co.absa.hyperdrive.trigger.models._

import scala.compat.java8.FutureConverters._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@RestController
class WorkflowController @Inject()(workflowService: WorkflowService) {

  implicit def eitherToCompletableFutureOrException[T](response: Future[Either[Seq[ApiError], T]]): CompletableFuture[T] =
    response.map {
      case Left(apiErrors) => throw new ApiException(apiErrors)
      case Right(result) => result
    }.toJava.toCompletableFuture

  @PutMapping(path = Array("/workflow"))
  def createWorkflow(@RequestBody workflow: WorkflowJoined): CompletableFuture[WorkflowJoined] = {
    workflowService.createWorkflow(workflow)
  }

  @GetMapping(path = Array("/workflow"))
  def getWorkflow(@RequestParam id: Long): CompletableFuture[WorkflowJoined] = {
    workflowService.getWorkflow(id).toJava.toCompletableFuture
  }

  @GetMapping(path = Array("/workflows"))
  def getWorkflows(): CompletableFuture[Seq[Workflow]] = {
    workflowService.getWorkflows.toJava.toCompletableFuture
  }

  @GetMapping(path = Array("/workflowsByProjectName"))
  def getWorkflowsByProjectName(@RequestParam projectName: String): CompletableFuture[Seq[Workflow]] = {
    workflowService.getWorkflowsByProjectName(projectName).toJava.toCompletableFuture
  }

  @DeleteMapping(path = Array("/workflows"))
  def deleteWorkflow(@RequestParam id: Long): CompletableFuture[Boolean] = {
    workflowService.deleteWorkflow(id).toJava.toCompletableFuture
  }

  @PostMapping(path = Array("/workflows"))
  def updateWorkflow(@RequestBody workflow: WorkflowJoined): CompletableFuture[WorkflowJoined] = {
    workflowService.updateWorkflow(workflow)
  }

  @PostMapping(path = Array("/workflows/activate"))
  def activateWorkflows(@RequestBody ids: Seq[Long]): CompletableFuture[Boolean] = {
    workflowService.switchWorkflowActiveState(ids).toJava.toCompletableFuture
  }

  @PostMapping(path = Array("/workflows/deactivate"))
  def deactivateWorkflows(@RequestBody ids: Seq[Long]): CompletableFuture[Boolean] = {
    workflowService.switchWorkflowActiveState(ids).toJava.toCompletableFuture
  }

  @PostMapping(path = Array("/workflows/{id}/switchActiveState"))
  def switchWorkflowActiveState(@PathVariable id: Long): CompletableFuture[Boolean] = {
    workflowService.switchWorkflowActiveState(id).toJava.toCompletableFuture
  }

  @GetMapping(path = Array("/workflows/projectNames"))
  def getProjectNames(): CompletableFuture[Set[String]] = {
    workflowService.getProjectNames.toJava.toCompletableFuture
  }

  @GetMapping(path = Array("/workflows/projects"))
  def getProjects(): CompletableFuture[Seq[Project]] = {
    workflowService.getProjects.toJava.toCompletableFuture
  }

  @GetMapping(path = Array("/workflows/projectsInfo"))
  def getProjectsInfo(): CompletableFuture[Seq[ProjectInfo]] = {
    workflowService.getProjectsInfo().toJava.toCompletableFuture
  }

  @PutMapping(path = Array("/workflow/run"))
  def runWorkflow(@RequestParam workflowId: Long): CompletableFuture[Boolean] = {
    workflowService.runWorkflow(workflowId).toJava.toCompletableFuture
  }

  @PutMapping(path = Array("/workflow/jobs/run"))
  def runWorkflowJobs(@RequestParam workflowId: Long, @RequestBody jobsToRun: JobsToRun): CompletableFuture[Boolean] = {
    workflowService.runWorkflowJobs(workflowId, jobsToRun.jobIds).toJava.toCompletableFuture
  }

  @GetMapping(path = Array("/workflow/export"))
  def exportWorkflow(@RequestParam id: Long): CompletableFuture[ResponseEntity[ByteArrayResource]] = {
    workflowService.exportWorkflow(id).map { workflowExport =>
      val resource = new ByteArrayResource(
        ObjectMapperSingleton.getObjectMapper.writerWithDefaultPrettyPrinter.writeValueAsBytes(workflowExport)
      )

      ResponseEntity.ok()
        .contentType(MediaType.parseMediaType("application/json"))
        .header(HttpHeaders.CONTENT_DISPOSITION, s"attachment; filename=${workflowExport.workflowJoined.name}.json")
        .body(resource)
    }.toJava.toCompletableFuture
  }

  @PostMapping(path = Array("/workflow/import"))
  def importWorkflow(@RequestPart("file") file: MultipartFile): CompletableFuture[WorkflowJoined] = {
    val workflowImport = ObjectMapperSingleton.getObjectMapper.readValue(file.getBytes, classOf[WorkflowImportExportWrapper])
    workflowService.importWorkflow(workflowImport)
  }

}
