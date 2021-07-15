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

import org.springframework.stereotype.Service
import play.api.libs.json.Json
import za.co.absa.hyperdrive.trigger.api.rest.utils.WSClientProvider
import za.co.absa.hyperdrive.trigger.models.JobInstance
import za.co.absa.hyperdrive.trigger.persistance.JobInstanceRepository
import za.co.absa.hyperdrive.trigger.scheduler.utilities.SparkExecutorConfig
import play.api.libs.ws.JsonBodyWritables.writeableOf_JsValue

import scala.concurrent.{ExecutionContext, Future}
import scala.util.Try

trait JobInstanceService {
  val jobInstanceRepository: JobInstanceRepository
  def getJobInstances(dagInstanceId: Long)(implicit ec: ExecutionContext): Future[Seq[JobInstance]]
  def killJob(applicationId: String)(implicit ec: ExecutionContext): Future[Boolean]
}

@Service
class JobInstanceServiceImpl(override val jobInstanceRepository: JobInstanceRepository) extends JobInstanceService {

  override def getJobInstances(dagInstanceId: Long)(implicit ec: ExecutionContext): Future[Seq[JobInstance]] = {
    jobInstanceRepository.getJobInstances(dagInstanceId)
  }

  override def killJob(applicationId: String)(implicit ec: ExecutionContext): Future[Boolean] = {
    val url: String =
      s"${SparkExecutorConfig.getHadoopResourceManagerUrlBase}/ws/v1/cluster/apps/$applicationId/state?user.name=${SparkExecutorConfig.getUserUsedToKillJob}"
    val data = Json.obj(
      "state" -> "KILLED"
    )

    Try {
      WSClientProvider.getWSClient.url(url).put(data).map { response =>
        response.status == 200 || response.status == 202
      }.recoverWith {
        case _ => Future.successful(false)
      }
    }.getOrElse(Future.successful(false))
  }
}
