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

import java.time.LocalDateTime
import org.mockito.ArgumentMatchers
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{BeforeAndAfterAll, BeforeAndAfterEach, FlatSpec, Matchers}
import za.co.absa.hyperdrive.trigger.models.{JobInstance, JobParameters}
import org.mockito.Mockito._
import org.mockito.ArgumentMatchers._
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.{Failed, InQueue, Running, Succeeded}
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes.Shell
import scala.concurrent.{Await, Future}
import scala.concurrent.duration.Duration
import scala.concurrent.ExecutionContext.Implicits.global

class ShellExecutorTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach with MockitoSugar {

  private val updateJobStub: JobInstance => Future[Unit] = mock[JobInstance => Future[Unit]]

  private val testScriptLocation = "/Users/abjba4j/Desktop/git/publicRepos/hyperdrive-trigger/src/test/resources/testShellScript.sh"
  private val testJobInstance = JobInstance(
    jobName = "jobName",
    jobType = Shell,
    jobParameters = JobParameters(variables = Map.empty[String, String], maps = Map.empty[String, Set[String]]),
    jobStatus = InQueue,
    executorJobId = None,
    created = LocalDateTime.now(),
    updated = None,
    order = 0,
    dagInstanceId = 0
  )

  override def beforeEach: Unit = {
    org.mockito.Mockito.reset(updateJobStub)
  }

  "ShellExecutor.execute" should "succeeded job when everything is set correctly" in {
    when(updateJobStub.apply(any[JobInstance])).thenReturn(Future.successful((): Unit))
    val testInput = testJobInstance.copy(
      jobParameters = testJobInstance.jobParameters.copy(
        variables = Map[String, String](
          "scriptLocation" -> testScriptLocation
        )
      )
    )

    Await.result(ShellExecutor.execute(testInput, updateJobStub.apply), Duration.Inf)

    verify(updateJobStub, times(2)).apply(ArgumentMatchers.any())
    verify(updateJobStub, times(1)).apply(ArgumentMatchers.eq(testInput.copy(jobStatus = Running)))
    verify(updateJobStub, times(1)).apply(ArgumentMatchers.eq(testInput.copy(jobStatus = Succeeded)))
  }

  "ShellExecutor.execute" should "fail job when job with running status is executed" in {
    when(updateJobStub.apply(any[JobInstance])).thenReturn(Future.successful((): Unit))
    val testInput = testJobInstance.copy(jobStatus = Running)

    Await.result(ShellExecutor.execute(testInput, updateJobStub.apply), Duration.Inf)

    verify(updateJobStub).apply(ArgumentMatchers.eq(testInput.copy(jobStatus = Failed)))
  }

  "ShellExecutor.execute" should "fail job when script cant be found" in {
    when(updateJobStub.apply(any[JobInstance])).thenReturn(Future.successful((): Unit))
    val testInput = testJobInstance.copy(
      jobParameters = testJobInstance.jobParameters.copy(
        variables = Map[String, String]("scriptLocation" -> "/invalidLocation/invalidScriptName.sh")
      )
    )

    Await.result(ShellExecutor.execute(testInput, updateJobStub.apply), Duration.Inf)

    verify(updateJobStub, times(2)).apply(ArgumentMatchers.any())
    verify(updateJobStub, times(1)).apply(ArgumentMatchers.eq(testInput.copy(jobStatus = Running)))
    verify(updateJobStub, times(1)).apply(ArgumentMatchers.eq(testInput.copy(jobStatus = Failed)))
  }

}
