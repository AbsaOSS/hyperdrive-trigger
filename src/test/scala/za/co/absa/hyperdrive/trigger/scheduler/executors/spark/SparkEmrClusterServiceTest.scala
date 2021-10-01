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

import com.amazonaws.services.elasticmapreduce.AmazonElasticMapReduce
import com.amazonaws.services.elasticmapreduce.model.{ActionOnFailure, AddJobFlowStepsRequest, AddJobFlowStepsResult, DescribeStepResult, ListStepsRequest, ListStepsResult, Step, StepState, StepStatus, StepSummary}
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.{reset, times, verify, when}
import org.mockito.invocation.InvocationOnMock
import org.mockito.stubbing.Answer
import org.scalatest.mockito.MockitoSugar
import org.scalatest.prop.TableDrivenPropertyChecks
import org.scalatest.{AsyncFlatSpec, BeforeAndAfter, Matchers, OptionValues}
import za.co.absa.hyperdrive.trigger.TestUtils.await
import za.co.absa.hyperdrive.trigger.configuration.application.DefaultTestSparkConfig
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.{InQueue, JobStatus, Submitting}
import za.co.absa.hyperdrive.trigger.models.{JobInstance, SparkInstanceParameters}

import java.time.LocalDateTime
import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}

class SparkEmrClusterServiceTest extends AsyncFlatSpec with Matchers with MockitoSugar with OptionValues
  with TableDrivenPropertyChecks with BeforeAndAfter {
  implicit override def executionContext: ExecutionContext = scala.concurrent.ExecutionContext.Implicits.global

  private trait HasUpdateJob {
    def updateJob(ji: JobInstance): Future[Unit]
  }

  private val mockUpdateJob = mock[HasUpdateJob]
  private val mockEmrClient = mock[AmazonElasticMapReduce]
  private val sparkConfig = DefaultTestSparkConfig.emr(
    filesToDeploy = Seq("/global/file/1", "/global/file/2"),
    additionalConfs = Map(
      "spark.driver.memory" -> "1g",
      "spark.driver.extraJavaOptions" -> "-DGlobalDriverOpt",
      "spark.executor.extraJavaOptions" -> "-DGlobalExecutorOpt"
    )
  )
  private val testEmrClusterProvider: EmrClusterProviderService = new EmrClusterProviderService {
    override def get(): AmazonElasticMapReduce = mockEmrClient
  }
  private val underTest = new SparkEmrClusterServiceImpl(sparkConfig, testEmrClusterProvider)

  before {
    reset(mockUpdateJob)
    reset(mockEmrClient)
  }

  "SparkEmrClusterService.submitJob" should "submit the job" in {
    // given
    val jobInstance = createJobInstance()
    val jobParameters = jobInstance.jobParameters.asInstanceOf[SparkInstanceParameters]
    val stepId = "s-123456789ABCDEF"
    var executorJobId = ""

    when(mockUpdateJob.updateJob(any())).thenAnswer(new Answer[Future[Unit]] {
      override def answer(invocation: InvocationOnMock): Future[Unit] = {
        val ji: JobInstance = invocation.getArgument(0)
        executorJobId = ji.executorJobId.get
        Future {}
      }
    })
    when(mockEmrClient.addJobFlowSteps(any())).thenReturn(new AddJobFlowStepsResult().withStepIds(stepId))

    // when
    await(underTest.submitJob(jobInstance, jobParameters, mockUpdateJob.updateJob))

    // then
    import scala.collection.JavaConverters._
    val jobInstanceCaptor: ArgumentCaptor[JobInstance] = ArgumentCaptor.forClass(classOf[JobInstance])
    verify(mockUpdateJob, times(2)).updateJob(jobInstanceCaptor.capture())
    val ji = jobInstanceCaptor.getAllValues.asScala.head
    ji.jobName shouldBe jobInstance.jobName
    ji.jobParameters shouldBe jobInstance.jobParameters
    ji.executorJobId.isDefined shouldBe true
    ji.jobStatus shouldBe Submitting
    val jiWithStepId = jobInstanceCaptor.getAllValues.asScala(1)
    jiWithStepId.stepId.value shouldBe stepId

    val addJobFlowStepsRequestCaptor: ArgumentCaptor[AddJobFlowStepsRequest] = ArgumentCaptor.forClass(classOf[AddJobFlowStepsRequest])
    verify(mockEmrClient).addJobFlowSteps(addJobFlowStepsRequestCaptor.capture())
    val addJobFlowStepsRequest = addJobFlowStepsRequestCaptor.getValue
    addJobFlowStepsRequest.getJobFlowId shouldBe sparkConfig.emr.clusterId
    addJobFlowStepsRequest.getSteps.asScala should have size 1
    val stepConfig = addJobFlowStepsRequest.getSteps.asScala.head
    stepConfig.getHadoopJarStep.getJar shouldBe "command-runner.jar"
    stepConfig.getHadoopJarStep.getArgs should contain theSameElementsInOrderAs Seq(
      "spark-submit",
      "--deploy-mode", "cluster",
      "--conf", "spark.executor.extraJavaOptions=-DGlobalExecutorOpt -DLocalExecutorOpt",
      "--conf", "spark.driver.memory=2g",
      "--conf", "spark.driver.extraJavaOptions=-DGlobalDriverOpt -DLocalDriverOpt",
      "--conf", s"spark.yarn.tags=$executorJobId",
      "--conf", "spark.executor.memory=2g",
      "--class", "mainClass",
      "--name", "jobName",
      "--files", "/global/file/1,/global/file/2,some/file/1,some/file/2",
      "--jars", "1.jar,2.jar",
      "--verbose",
      "job.jar",
      "arg1", "arg2", "key1=value1", "key2=value2")
    stepConfig.getActionOnFailure shouldBe ActionOnFailure.CONTINUE.toString
    stepConfig.getName shouldBe jobInstance.jobName + "_" + executorJobId
  }

  private val cases = Table(
    ("stepState", "jobStatus"),
    (StepState.PENDING, JobStatuses.Submitting),
    (StepState.CANCEL_PENDING, JobStatuses.Submitting),
    (StepState.RUNNING, JobStatuses.Running),
    (StepState.COMPLETED, JobStatuses.Succeeded),
    (StepState.CANCELLED, JobStatuses.Killed),
    (StepState.FAILED, JobStatuses.Failed),
    (StepState.INTERRUPTED, JobStatuses.Failed)
  )

  forAll(cases) {(stepState: StepState, jobStatus: JobStatus) =>
    "handleMissingYarnStatusForJobStatusSubmitting" should s"update the job status ${jobStatus}, when state is ${stepState}" in {
      // given
      val jobInstance = createJobInstance().copy(stepId = Some("abcd"))
      when(mockUpdateJob.updateJob(any())).thenReturn(Future {})
      when(mockEmrClient.describeStep(any())).thenReturn(new DescribeStepResult()
        .withStep(new Step()
          .withStatus(new StepStatus()
            .withState(stepState))))

      // when
      await(underTest.handleMissingYarnStatusForJobStatusSubmitting(jobInstance, mockUpdateJob.updateJob))

      // then
      val jobInstanceCaptor: ArgumentCaptor[JobInstance] = ArgumentCaptor.forClass(classOf[JobInstance])
      verify(mockUpdateJob).updateJob(jobInstanceCaptor.capture())
      val ji = jobInstanceCaptor.getValue
      ji.jobStatus shouldBe jobStatus
    }
  }

  "handleMissingYarnStatusForJobStatusSubmitting" should "update the job status using the step name if the step id is missing" in {
    // given
    import scala.collection.JavaConverters._
    val executorJobId = "executorJobId" + UUID.randomUUID().toString
    val jobName = "jobName"
    val stepId = "s-abcdefghi"

    val stepSummariesPage1 = (11 to 15).map(createTestStepSummary)
    val paginationMarker = "paginationMarker" + UUID.randomUUID().toString
    val stepSummariesPage2 = (21 to 25).map(createTestStepSummary) :+ new StepSummary()
      .withId(stepId)
      .withName(s"${jobName}_${executorJobId}")
      .withStatus(new StepStatus().withState(StepState.RUNNING))
    val jobInstance = createJobInstance().copy(jobName = jobName, executorJobId = Some(executorJobId))
    when(mockUpdateJob.updateJob(any())).thenReturn(Future{})
    when(mockEmrClient.listSteps(any())).thenAnswer(new Answer[ListStepsResult] {
      override def answer(invocation: InvocationOnMock): ListStepsResult = {
        val marker = invocation.getArgument[ListStepsRequest](0).getMarker
        if (marker == null) {
          new ListStepsResult()
            .withSteps(stepSummariesPage1.asJava)
            .withMarker(paginationMarker)
        } else {
          new ListStepsResult().withSteps(stepSummariesPage2.asJava)
        }
      }
    })

    // when
    await(underTest.handleMissingYarnStatusForJobStatusSubmitting(jobInstance, mockUpdateJob.updateJob))

    // then
    val jobInstanceCaptor: ArgumentCaptor[JobInstance] = ArgumentCaptor.forClass(classOf[JobInstance])
    verify(mockUpdateJob).updateJob(jobInstanceCaptor.capture())
    val ji = jobInstanceCaptor.getValue
    ji.jobStatus shouldBe JobStatuses.Running
    ji.stepId.value shouldBe stepId
  }

  it should "update the job status to lost if no step with matching name or id exists" in {
    import scala.collection.JavaConverters._
    val executorJobId = UUID.randomUUID().toString
    val jobInstance = createJobInstance().copy(executorJobId = Some(executorJobId))
    when(mockUpdateJob.updateJob(any())).thenReturn(Future{})
    when(mockEmrClient.listSteps(any())).thenReturn(new ListStepsResult().withSteps(Seq[StepSummary]().asJava))

    // when
    await(underTest.handleMissingYarnStatusForJobStatusSubmitting(jobInstance, mockUpdateJob.updateJob))

    // then
    val jobInstanceCaptor: ArgumentCaptor[JobInstance] = ArgumentCaptor.forClass(classOf[JobInstance])
    verify(mockUpdateJob).updateJob(jobInstanceCaptor.capture())
    val ji = jobInstanceCaptor.getValue
    ji.jobStatus shouldBe JobStatuses.Lost
  }

  private def createJobInstance() = {
    JobInstance(
      jobName = "jobName",
      jobParameters = SparkInstanceParameters(
        jobJar = "job.jar",
        mainClass = "mainClass",
        appArguments = List("arg1", "arg2", "key1=value1", "key2=value2"),
        additionalJars = List("1.jar", "2.jar"),
        additionalFiles = List("some/file/1", "some/file/2"),
        additionalSparkConfig = Map(
          "spark.driver.extraJavaOptions" -> "-DLocalDriverOpt",
          "spark.executor.extraJavaOptions" -> "-DLocalExecutorOpt",
          "spark.driver.memory" -> "2g",
          "spark.executor.memory" -> "2g")
      ),
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

  private def createTestStepSummary(id: Int) = {
    new StepSummary()
      .withId(s"$id")
      .withName(s"job_$id")
      .withStatus(new StepStatus().withState(StepState.RUNNING))
  }
}
