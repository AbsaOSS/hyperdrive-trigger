package za.co.absa.hyperdrive.trigger.api.rest.controllers

import java.util.concurrent.CompletableFuture

import javax.inject.Inject
import org.springframework.web.bind.annotation._
import za.co.absa.hyperdrive.trigger.api.rest.services.RunService
import za.co.absa.hyperdrive.trigger.models.{OverallStatistics, PerDagStatistics, PerProjectStatistics, PerWorkflowStatistics}

import scala.compat.java8.FutureConverters._
import scala.concurrent.ExecutionContext.Implicits.global

@RestController
class RunController @Inject()(runService: RunService) {

  @GetMapping(path = Array("/runs/overallStatistics"))
  def getOverallStatistics(): CompletableFuture[OverallStatistics] = {
    runService.getOverallStatistics().toJava.toCompletableFuture
  }

  @GetMapping(path = Array("/runs/perDagStatistics"))
  def getPerDagStatistics(@RequestParam workflowId: Long): CompletableFuture[Seq[PerDagStatistics]] = {
    runService.getPerDagStatistics(workflowId).toJava.toCompletableFuture
  }

  @GetMapping(path = Array("/runs/perProjectStatistics"))
  def getPerProjectStatistics(): CompletableFuture[Seq[PerProjectStatistics]] = {
    runService.getPerProjectStatistics().toJava.toCompletableFuture
  }

  @GetMapping(path = Array("/runs/perWorkflowStatistics"))
  def getPerWorkflowStatistics(@RequestParam projectName: String): CompletableFuture[Seq[PerWorkflowStatistics]] = {
    runService.getPerWorkflowStatistics(projectName).toJava.toCompletableFuture
  }

}

