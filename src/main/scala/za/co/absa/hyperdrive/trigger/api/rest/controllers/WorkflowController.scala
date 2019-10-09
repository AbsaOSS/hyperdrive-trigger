/*
 * Copyright 2018-2019 ABSA Group Limited
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

import za.co.absa.hyperdrive.trigger.api.rest.services.WorkflowService
import za.co.absa.hyperdrive.trigger.models.{ProjectInfo, Workflow, WorkflowJoined, WorkflowState}
import javax.inject.Inject
import org.springframework.web.bind.annotation._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.compat.java8.FutureConverters._

@RestController
class WorkflowController @Inject()(workflowService: WorkflowService) {

  @PutMapping(path = Array("/workflow"))
  def createWorkflow(@RequestBody workflow: WorkflowJoined): CompletableFuture[Boolean] = {
    workflowService.createWorkflow(workflow).toJava.toCompletableFuture
  }

  @GetMapping(path = Array("/workflow"))
  def getWorkflow(@RequestParam id: Long): CompletableFuture[Option[WorkflowJoined]] = {
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
  def updateWorkflow(@RequestBody workflow: WorkflowJoined): CompletableFuture[Boolean] = {
    workflowService.updateWorkflow(workflow).toJava.toCompletableFuture
  }

  @PostMapping(path = Array("/workflows/{id}/setActiveState"))
  def updateWorkflowActiveState(@PathVariable id: Long, @RequestBody workflowState: WorkflowState): CompletableFuture[Boolean] = {
    workflowService.updateWorkflowActiveState(id, workflowState.isActive).toJava.toCompletableFuture
  }

  @GetMapping(path = Array("/workflows/projects"))
  def getProjects(): CompletableFuture[Set[String]] = {
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

}