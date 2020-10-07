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

import java.io.ByteArrayOutputStream
import java.util.concurrent.CompletableFuture
import java.util.zip.{ZipEntry, ZipOutputStream}

import javax.inject.Inject
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.io.ByteArrayResource
import org.springframework.http.{HttpHeaders, MediaType, ResponseEntity}
import org.springframework.web.bind.annotation._
import org.springframework.web.multipart.MultipartFile
import za.co.absa.hyperdrive.trigger.ObjectMapperSingleton
import za.co.absa.hyperdrive.trigger.api.rest.services.WorkflowService
import za.co.absa.hyperdrive.trigger.models._
import za.co.absa.hyperdrive.trigger.models.errors.{ApiError, ApiException, GenericError}

import scala.compat.java8.FutureConverters._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{ExecutionContext, Future}

@RestController
class WorkflowController @Inject()(workflowService: WorkflowService) {

  @Value("${environment:}")
  val environment: String = ""

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

  @PostMapping(path = Array("/workflows/{id}/switchActiveState"))
  def switchWorkflowActiveState(@PathVariable id: Long): CompletableFuture[Boolean] = {
    workflowService.switchWorkflowActiveState(id).toJava.toCompletableFuture
  }

  @PostMapping(path = Array("/workflows/isActive"))
  def updateWorkflowsIsActive(@RequestBody jobIdsWrapper: JobIdsWrapper, @RequestParam isActiveNewValue: Boolean): CompletableFuture[Boolean] = {
    workflowService.updateWorkflowsIsActive(jobIdsWrapper.jobIds, isActiveNewValue).toJava.toCompletableFuture
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
  def runWorkflowJobs(@RequestParam workflowId: Long, @RequestBody jobIdsWrapper: JobIdsWrapper): CompletableFuture[Boolean] = {
    workflowService.runWorkflowJobs(workflowId, jobIdsWrapper.jobIds).toJava.toCompletableFuture
  }

  @GetMapping(path = Array("/workflows/export"))
  def exportWorkflows(@RequestParam jobIds: Array[Long]): CompletableFuture[ResponseEntity[ByteArrayResource]] = {
    workflowService.exportWorkflows(jobIds).map { exportItems =>
      if (exportItems.isEmpty) {
        val jobIdsString = jobIds.map(_.toString).reduce(_ + ", " + _)
        throw new ApiException(GenericError(s"The requested workflows with ids $jobIdsString don't exist."))
      }
      else if (exportItems.size == 1) {
        exportWorkflowAsJson(exportItems.head)
      } else {
        exportWorkflowsAsZip(exportItems)
      }
    }.toJava.toCompletableFuture
  }

  private def exportWorkflowsAsZip(workflowExports: Seq[WorkflowImportExportWrapper])(implicit ec: ExecutionContext): ResponseEntity[ByteArrayResource] = {
    val baos = new ByteArrayOutputStream()
    val zos = new ZipOutputStream(baos)
    workflowExports.foreach(workflowExport => {
      val byteArray = ObjectMapperSingleton.getObjectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(workflowExport)
      val zipEntry = new ZipEntry(s"${workflowExport.workflowJoined.name}.json")
      zos.putNextEntry(zipEntry)
      zos.write(byteArray, 0, byteArray.size)
      zos.closeEntry()
    })

    zos.close()
    baos.close()

    ResponseEntity.ok()
      .contentType(MediaType.parseMediaType("application/zip"))
      .header(HttpHeaders.CONTENT_DISPOSITION, s"attachment; filename=workflows-${environment}.zip")
      .body(new ByteArrayResource(baos.toByteArray))
  }

  private def exportWorkflowAsJson(workflowExport: WorkflowImportExportWrapper): ResponseEntity[ByteArrayResource] = {
    val resource = new ByteArrayResource(
      ObjectMapperSingleton.getObjectMapper.writerWithDefaultPrettyPrinter.writeValueAsBytes(workflowExport)
    )
    ResponseEntity.ok()
      .contentType(MediaType.parseMediaType("application/json"))
      .header(HttpHeaders.CONTENT_DISPOSITION, s"attachment; filename=${workflowExport.workflowJoined.name}.json")
      .body(resource)
  }

  @PostMapping(path = Array("/workflow/import"))
  def importWorkflow(@RequestPart("file") file: MultipartFile): CompletableFuture[WorkflowJoined] = {
    val workflowImport = ObjectMapperSingleton.getObjectMapper.readValue(file.getBytes, classOf[WorkflowImportExportWrapper])
    workflowService.importWorkflow(workflowImport)
  }

}
