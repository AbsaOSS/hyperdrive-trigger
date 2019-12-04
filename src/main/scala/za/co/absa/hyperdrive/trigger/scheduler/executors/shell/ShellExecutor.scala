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

package za.co.absa.hyperdrive.trigger.scheduler.executors.shell

import za.co.absa.hyperdrive.trigger.models.JobInstance
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses._
import za.co.absa.hyperdrive.trigger.scheduler.executors.Executor

import scala.concurrent.{ExecutionContext, Future}
import scala.sys.process._

object ShellExecutor extends Executor {

  override def execute(jobInstance: JobInstance, updateJob: JobInstance => Future[Unit])
                      (implicit executionContext: ExecutionContext): Future[Unit] = {
    val shellParameters = ShellParameters(jobInstance.jobParameters)

    val result = shellParameters.scriptLocation.!

    result match {
      case 0 => updateJob(jobInstance.copy(jobStatus = Succeeded))
      case _ => updateJob(jobInstance.copy(jobStatus = Failed))
    }

    Future.successful(Unit)
  }

}
