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

import org.springframework.web.bind.annotation.{GetMapping, PathVariable, RestController}
import za.co.absa.hyperdrive.trigger.api.rest.services.ConfluentService
import za.co.absa.hyperdrive.trigger.models.KafkaTopicAuthorizationResponse

import java.util.concurrent.CompletableFuture
import javax.inject.Inject
import scala.compat.java8.FutureConverters._
import scala.concurrent.ExecutionContext.Implicits.global

@RestController
class ConfluentController @Inject() (confluentService: ConfluentService) {

  @GetMapping(path = Array("/kafka/{kafkaTopic}/authorizations"))
  def getKafkaTopicAuthorizations(
    @PathVariable kafkaTopic: String
  ): CompletableFuture[KafkaTopicAuthorizationResponse] =
    confluentService.getKafkaTopicAuthorizations(kafkaTopic).toJava.toCompletableFuture
}
