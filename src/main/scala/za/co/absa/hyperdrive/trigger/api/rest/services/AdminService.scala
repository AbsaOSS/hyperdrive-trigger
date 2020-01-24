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

package za.co.absa.hyperdrive.trigger.api.rest.services

import javax.inject.Inject
import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.HyperDriverManager

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

trait AdminService {
  def isManagerRunning: Future[Boolean]
  def startManager: Future[Boolean]
  def stopManager: Future[Boolean]
}

@Service
class AdminServiceImpl @Inject()(hyperDriverManager: HyperDriverManager) extends AdminService {

  override def isManagerRunning: Future[Boolean] = {
    Future.successful(hyperDriverManager.isManagerRunning)
  }

  override def startManager: Future[Boolean] = {
    Future.successful(hyperDriverManager.startManager).map(_=>true)
  }

  override def stopManager: Future[Boolean] = {
    hyperDriverManager.stopManager.map(_=>true)
  }

}
