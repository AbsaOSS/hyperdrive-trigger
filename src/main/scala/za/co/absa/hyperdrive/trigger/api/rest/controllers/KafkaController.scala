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

import org.springframework.core.MethodParameter
import org.springframework.web.bind.annotation._
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException
import za.co.absa.hyperdrive.trigger.api.rest.services.KafkaService

import java.util.concurrent.CompletableFuture
import javax.inject.Inject
import scala.util.{Failure, Success, Try}
import scala.compat.java8.FutureConverters._
import scala.concurrent.ExecutionContext.Implicits.global

@RestController
class KafkaController @Inject()(kafkaService: KafkaService) {
  @GetMapping(path = Array("/topics/{topicName}/exists"))
  def existsTopic(@PathVariable topicName: String, @RequestParam servers: Array[String], @RequestParam(required = false, defaultValue = "") properties: Array[String]): CompletableFuture[Boolean] = {
    Try {
      Map(properties map { property =>
        val splitProperty = property.split("=")
        splitProperty(0) -> splitProperty(1)
      }: _*)
    } match {
      case Success(propertiesMap) => kafkaService.existsTopic(topicName, servers, propertiesMap).toJava.toCompletableFuture
      case Failure(exception) => throw new MethodArgumentTypeMismatchException(
        properties,
        Map.getClass,
        "properties",
        new MethodParameter(
          classOf[KafkaController].getMethod("existsTopic", classOf[String], classOf[Array[String]], classOf[Array[String]]),
          2
        ),
        exception
      )
    }
  }
}
