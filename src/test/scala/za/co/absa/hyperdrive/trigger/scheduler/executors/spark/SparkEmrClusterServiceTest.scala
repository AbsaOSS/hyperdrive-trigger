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
import com.amazonaws.services.elasticmapreduce.model.{ActionOnFailure, AddJobFlowStepsRequest, AddJobFlowStepsResult}
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.{verify, when}
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{AsyncFlatSpec, BeforeAndAfterAll, Matchers}
import za.co.absa.hyperdrive.trigger.TestUtils.await
import za.co.absa.hyperdrive.trigger.configuration.application.DefaultTestSparkConfig
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.{InQueue, Submitting}
import za.co.absa.hyperdrive.trigger.models.{JobInstance, SparkInstanceParameters}

import java.time.LocalDateTime
import scala.concurrent.{ExecutionContext, Future}

class SparkEmrClusterServiceTest extends AsyncFlatSpec with Matchers with MockitoSugar with BeforeAndAfterAll {
  implicit override def executionContext: ExecutionContext = scala.concurrent.ExecutionContext.Implicits.global

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

  "SparkEmrClusterService.submitJob" should "submit the job" in {
    // given
    val jobInstance = createJobInstance()
    val jobParameters = jobInstance.jobParameters.asInstanceOf[SparkInstanceParameters]
    var executorJobId = ""
    val updateJob = (ji: JobInstance) => {
      ji.jobName shouldBe jobInstance.jobName
      ji.jobParameters shouldBe jobInstance.jobParameters
      ji.executorJobId.isDefined shouldBe true
      ji.jobStatus shouldBe Submitting
      executorJobId = ji.executorJobId.get
      Future{}
    }
    when(mockEmrClient.addJobFlowSteps(any())).thenReturn(new AddJobFlowStepsResult())

    // when
    await(underTest.submitJob(jobInstance, jobParameters, updateJob))

    // then
    val addJobFlowStepsRequestCaptor: ArgumentCaptor[AddJobFlowStepsRequest] = ArgumentCaptor.forClass(classOf[AddJobFlowStepsRequest])
    verify(mockEmrClient).addJobFlowSteps(addJobFlowStepsRequestCaptor.capture())
    val addJobFlowStepsRequest = addJobFlowStepsRequestCaptor.getValue
    addJobFlowStepsRequest.getJobFlowId shouldBe sparkConfig.emr.clusterId
    import scala.collection.JavaConverters._
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
    stepConfig.getName shouldBe jobInstance.jobName
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
      created = LocalDateTime.now(),
      updated = None,
      order = 0,
      dagInstanceId = 0
    )
  }
}
