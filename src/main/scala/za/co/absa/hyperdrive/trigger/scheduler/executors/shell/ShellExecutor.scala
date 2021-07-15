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

package za.co.absa.hyperdrive.trigger.scheduler.executors.shell

import org.slf4j.LoggerFactory
import za.co.absa.hyperdrive.trigger.models.{JobInstance, ShellInstanceParameters}
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses._
import za.co.absa.hyperdrive.trigger.scheduler.executors.Executor

import scala.concurrent.{ExecutionContext, Future}
import scala.sys.process._
import scala.util.Try

object ShellExecutor extends Executor[ShellInstanceParameters] {
  private val logger = LoggerFactory.getLogger(this.getClass)

  override def execute(jobInstance: JobInstance, jobParameters: ShellInstanceParameters, updateJob: JobInstance => Future[Unit])
                      (implicit executionContext: ExecutionContext): Future[Unit] = {
    jobInstance.jobStatus match {
      case status if status == InQueue => executeJob(jobInstance, jobParameters, updateJob)
      case status if status == Running => updateJob(jobInstance.copy(jobStatus = Failed))
      case _ => updateJob(jobInstance.copy(jobStatus = Lost))
    }
  }

  private def executeJob(jobInstance: JobInstance, jobParameters: ShellInstanceParameters, updateJob: JobInstance => Future[Unit])
                        (implicit executionContext: ExecutionContext): Future[Unit] = {
    updateJob(jobInstance.copy(jobStatus = Running)).map { _ =>
      Try {
        jobParameters.scriptLocation.!(new ProcessLogger {
          override def out(s: => String): Unit = logger.info(s)
          override def err(s: => String): Unit = logger.error(s)
          override def buffer[T](f: => T): T = f
        })
      }.getOrElse(Int.MaxValue)
    } flatMap {
      case 0 => updateJob(jobInstance.copy(jobStatus = Succeeded))
      case _ => updateJob(jobInstance.copy(jobStatus = Failed))
    }
  }
}
