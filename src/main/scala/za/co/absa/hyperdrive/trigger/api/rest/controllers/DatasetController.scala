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
