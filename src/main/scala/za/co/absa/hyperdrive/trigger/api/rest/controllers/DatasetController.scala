package za.co.absa.hyperdrive.trigger.api.rest.controllers

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import za.co.absa.hyperdrive.trigger.api.rest.services.DatasetService
import za.co.absa.hyperdrive.trigger.models.VersionedDataset

import java.util.Optional
import java.util.concurrent.CompletableFuture
import javax.inject.Inject
import scala.compat.java8.FutureConverters._
import scala.compat.java8.OptionConverters._
import scala.concurrent.ExecutionContext.Implicits.global

@RestController
class DatasetController @Inject() (datasetService: DatasetService) {

  @GetMapping(path = Array("/dataset/search"))
  def search(@RequestParam searchQuery: Optional[String]): CompletableFuture[Seq[VersionedDataset]] =
    datasetService.search(searchQuery.asScala).toJava.toCompletableFuture
}
