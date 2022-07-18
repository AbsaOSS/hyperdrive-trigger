
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

package za.co.absa.hyperdrive.trigger.scheduler.executors.spark

import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.{never, reset, verify, when}
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{AsyncFlatSpec, BeforeAndAfter, Matchers}
import za.co.absa.hyperdrive.trigger.api.rest.services.HyperdriveOffsetComparisonService
import za.co.absa.hyperdrive.trigger.configuration.application.{DefaultTestSparkConfig, SparkConfig}
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.InQueue
import za.co.absa.hyperdrive.trigger.models.enums.{JobStatuses, JobTypes}
import za.co.absa.hyperdrive.trigger.models.{JobInstance, SparkInstanceParameters}

import java.time.LocalDateTime
import scala.concurrent.Future

class HyperdriveExecutorTest extends AsyncFlatSpec with MockitoSugar with BeforeAndAfter with Matchers {
  private val offsetComparisonServiceMock = mock[HyperdriveOffsetComparisonService]
  private val sparkClusterServiceMock = mock[SparkClusterService]
  private val updateJobStub: JobInstance => Future[Unit] = mock[JobInstance => Future[Unit]]

  before {
    reset(offsetComparisonServiceMock)
    reset(sparkClusterServiceMock)
    reset(updateJobStub)
  }

  it should "submit a job if it is required" in {
    val jobInstance = getJobInstance
    val jobInstanceParameters = jobInstance.jobParameters.asInstanceOf[SparkInstanceParameters]

    when(offsetComparisonServiceMock.isNewJobInstanceRequired(any())(any())).thenReturn(Future{true})
    when(sparkClusterServiceMock.submitJob(any(), any(), any())).thenReturn(Future {(): Unit})
    when(updateJobStub.apply(any[JobInstance])).thenReturn(Future {(): Unit})

    implicit val sparkConfig: SparkConfig = DefaultTestSparkConfig().yarn
    val resultFut = HyperdriveExecutor.execute(jobInstance, jobInstanceParameters, updateJobStub, sparkClusterServiceMock, offsetComparisonServiceMock)

    resultFut.map { _ =>
      verify(sparkClusterServiceMock).submitJob(any(), any(), any())
      verify(updateJobStub, never()).apply(any())
      succeed
    }
  }

  it should "not submit a job if it is not required" in {
    val jobInstance = getJobInstance
    val jobInstanceParameters = jobInstance.jobParameters.asInstanceOf[SparkInstanceParameters]

    when(offsetComparisonServiceMock.isNewJobInstanceRequired(any())(any())).thenReturn(Future{false})
    when(sparkClusterServiceMock.submitJob(any(), any(), any())).thenReturn(Future {(): Unit})
    when(updateJobStub.apply(any[JobInstance])).thenReturn(Future {(): Unit})

    implicit val sparkConfig: SparkConfig = DefaultTestSparkConfig().yarn
    val resultFut = HyperdriveExecutor.execute(jobInstance, jobInstanceParameters, updateJobStub, sparkClusterServiceMock, offsetComparisonServiceMock)

    resultFut.map { _ =>
      verify(sparkClusterServiceMock, never()).submitJob(any(), any(), any())
      val jiCaptor: ArgumentCaptor[JobInstance] = ArgumentCaptor.forClass(classOf[JobInstance])
      verify(updateJobStub).apply(jiCaptor.capture())
      jiCaptor.getValue.jobStatus shouldBe JobStatuses.NoData
    }
  }

  private def getJobInstance = {
    val jobInstanceParameters = SparkInstanceParameters(
      jobType = JobTypes.Hyperdrive,
      jobJar = "job.jar",
      mainClass = "mainClass",
      appArguments = List()
    )
    JobInstance(
      jobName = "jobName",
      jobParameters = jobInstanceParameters,
      jobStatus = InQueue,
      executorJobId = None,
      applicationId = None,
      stepId = None,
      created = LocalDateTime.now(),
      updated = None,
      order = 0,
      dagInstanceId = 0
    )
  }
}
