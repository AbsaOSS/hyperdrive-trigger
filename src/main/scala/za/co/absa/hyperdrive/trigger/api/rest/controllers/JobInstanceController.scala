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

}

