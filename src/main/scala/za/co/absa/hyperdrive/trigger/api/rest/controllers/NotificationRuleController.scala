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

import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation._
import za.co.absa.hyperdrive.trigger.api.rest.services.NotificationRuleService
import za.co.absa.hyperdrive.trigger.models._
import za.co.absa.hyperdrive.trigger.models.search.{TableSearchRequest, TableSearchResponse}

import java.util.concurrent.CompletableFuture
import javax.inject.Inject
import scala.compat.java8.FutureConverters._
import scala.concurrent.ExecutionContext.Implicits.global

@RestController
class NotificationRuleController @Inject()(notificationRuleService: NotificationRuleService) {
  private val logger = LoggerFactory.getLogger(this.getClass)

  @PutMapping(path = Array("/notificationRule"))
  def createNotificationRule(@RequestBody notificationRule: NotificationRule): CompletableFuture[NotificationRule] = {
    notificationRuleService.createNotificationRule(notificationRule).toJava.toCompletableFuture
  }

  @GetMapping(path = Array("/notificationRule"))
  def getNotificationRule(@RequestParam id: Long): CompletableFuture[NotificationRule] = {
    notificationRuleService.getNotificationRule(id).toJava.toCompletableFuture
  }

  @GetMapping(path = Array("/notificationRules"))
  def getNotificationRules(): CompletableFuture[Seq[NotificationRule]] = {
    notificationRuleService.getNotificationRules().toJava.toCompletableFuture
  }

  @PostMapping(path = Array("/notificationRule"))
  def updateNotificationRule(@RequestBody notificationRule: NotificationRule): CompletableFuture[NotificationRule] = {
    notificationRuleService.updateNotificationRule(notificationRule).toJava.toCompletableFuture
  }

  @DeleteMapping(path = Array("/notificationRule"))
  def deleteNotificationRule(@RequestParam id: Long): CompletableFuture[Boolean] = {
    notificationRuleService.deleteNotificationRule(id).toJava.toCompletableFuture
  }

  @PostMapping(path = Array("/notificationRules/search"))
  def searchNotificationRules(@RequestBody searchRequest: TableSearchRequest): CompletableFuture[TableSearchResponse[NotificationRule]] = {
    notificationRuleService.searchNotificationRules(searchRequest).toJava.toCompletableFuture
  }
}
