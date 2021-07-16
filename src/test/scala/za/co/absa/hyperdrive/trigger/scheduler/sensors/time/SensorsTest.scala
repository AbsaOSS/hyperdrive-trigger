
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

package za.co.absa.hyperdrive.trigger.scheduler.sensors.time

import java.util.{Properties, concurrent}
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.{reset, times, verify, when}
import org.quartz.impl.matchers.GroupMatcher
import org.quartz.impl.triggers.CronTriggerImpl
import org.quartz.{JobKey, TriggerKey}
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{Assertion, BeforeAndAfter, FlatSpec, Matchers}
import za.co.absa.hyperdrive.trigger.TestUtils.await
import za.co.absa.hyperdrive.trigger.configuration.application.KafkaConfig
import za.co.absa.hyperdrive.trigger.models._
import za.co.absa.hyperdrive.trigger.persistance.{DagInstanceRepository, SensorRepository}
import za.co.absa.hyperdrive.trigger.scheduler.eventProcessor.EventProcessor
import za.co.absa.hyperdrive.trigger.scheduler.sensors.Sensors

import scala.concurrent.{ExecutionContext, ExecutionContextExecutor, Future}

class SensorsTest extends FlatSpec with MockitoSugar with Matchers with BeforeAndAfter {
  private implicit val executionContext: ExecutionContextExecutor =
    ExecutionContext.fromExecutor(concurrent.Executors.newSingleThreadExecutor())
  private val sensorRepository = mock[SensorRepository]
  private val eventProcessor = mock[EventProcessor]
  private val dagInstanceRepository = mock[DagInstanceRepository]
  private val kafkaConfig: KafkaConfig = new KafkaConfig(new Properties(), "groupIdPrefix", 100)

  before {
    reset(sensorRepository)
    reset(eventProcessor)
  }

  "Sensors.processEvents" should "add a new time sensor" in {
    // given
    val sensorId = 1
    val cronExpression = "0 10 * ? * * *" // every hour at xx:10
    val workflowId = 101L
    val timeSensor = createTimeSensor(sensorId, workflowId, cronExpression)

    when(sensorRepository.getChangedSensors(any())(any[ExecutionContext])).thenReturn(Future{Seq.empty})
    when(sensorRepository.getInactiveSensors(any())(any[ExecutionContext])).thenReturn(Future{Seq.empty})
    when(sensorRepository.getNewActiveAssignedSensors(any(), any())(any[ExecutionContext])).thenReturn(Future{Seq(timeSensor)})

    val underTest = new Sensors(eventProcessor, sensorRepository, dagInstanceRepository, kafkaConfig)

    // when
    underTest.prepareSensors()
    await(underTest.processEvents(Seq(workflowId), firstIteration = false))

    verifyQuartzJobExists(sensorId, cronExpression)

    underTest.cleanUpSensors()
  }

  it should "remove an inactive sensor" in {
    // given
    val sensorId = 1L
    val cronExpression = "0 10 * ? * * *" // every hour at xx:10
    val workflowId = 101L
    val timeSensor = createTimeSensor(sensorId, workflowId, cronExpression)

    val sensorId2 = 2L
    val cronExpression2 = "0 0/10 * ? * * *" // every hour every 10 minutes
    val workflowId2 = 102L
    val timeSensor2 = createTimeSensor(sensorId2, workflowId2, cronExpression2)

    when(sensorRepository.getChangedSensors(any())(any[ExecutionContext])).thenReturn(Future{Seq.empty})
    when(sensorRepository.getInactiveSensors(any())(any[ExecutionContext])).thenReturn(
      Future {Seq.empty[Long]},
      Future {Seq(sensorId)}
    )
    when(sensorRepository.getNewActiveAssignedSensors(any(), any())(any[ExecutionContext])).thenReturn(
      Future {Seq(timeSensor, timeSensor2)},
      Future {Seq.empty}
    )
    val underTest = new Sensors(eventProcessor, sensorRepository, dagInstanceRepository, kafkaConfig)

    // when, then
    underTest.prepareSensors()
    await(underTest.processEvents(Seq(workflowId, workflowId2), firstIteration = false))
    verifyQuartzJobExists(sensorId, cronExpression)
    verifyQuartzJobExists(sensorId2, cronExpression2)

    await(underTest.processEvents(Seq(workflowId, workflowId2), firstIteration = false))
    verifyQuartzJobNotExists(sensorId)
    verifyQuartzJobExists(sensorId2, cronExpression2)

    underTest.cleanUpSensors()
  }

  it should "add a newly activated sensor" in {
    // given
    val sensorId = 1L
    val cronExpression = "0 10 * ? * * *" // every hour at xx:10
    val workflowId = 101L
    val timeSensor = createTimeSensor(sensorId, workflowId, cronExpression)

    val sensorId2 = 2L
    val cronExpression2 = "0 0/10 * ? * * *" // every hour every 10 minutes
    val workflowId2 = 102L
    val timeSensor2 = createTimeSensor(sensorId2, workflowId2, cronExpression2)

    val sensorId3 = 3L
    val cronExpression3 = "0 0 18 ? * * *" // every day at 18:00
    val workflowId3 = 103L
    val timeSensor3 = createTimeSensor(sensorId3, workflowId3, cronExpression3)

    when(sensorRepository.getChangedSensors(any())(any[ExecutionContext])).thenReturn(Future{Seq.empty})
    when(sensorRepository.getInactiveSensors(any())(any[ExecutionContext])).thenReturn(
      Future {Seq.empty},
      Future {Seq(sensorId, sensorId2)},
      Future {Seq(sensorId3)}
    )
    when(sensorRepository.getNewActiveAssignedSensors(any(), any())(any[ExecutionContext])).thenReturn(
      Future {Seq(timeSensor, timeSensor2)},
      Future {Seq(timeSensor3)},
      Future {Seq(timeSensor)}
    )
    val underTest = new Sensors(eventProcessor, sensorRepository, dagInstanceRepository, kafkaConfig)

    // when, then
    underTest.prepareSensors()
    await(underTest.processEvents(Seq(workflowId, workflowId2, workflowId3), firstIteration = false))
    verifyQuartzJobExists(sensorId, cronExpression)
    verifyQuartzJobExists(sensorId2, cronExpression2)
    await(underTest.processEvents(Seq(workflowId, workflowId2, workflowId3), firstIteration = false))
    verifyQuartzJobNotExists(sensorId)
    verifyQuartzJobNotExists(sensorId2)
    verifyQuartzJobExists(sensorId3, cronExpression3)

    await(underTest.processEvents(Seq(workflowId, workflowId2, workflowId3), firstIteration = false))
    verifyQuartzJobExists(sensorId, cronExpression)
    verifyQuartzJobNotExists(sensorId3)

    underTest.cleanUpSensors()
  }

  it should "update a time sensor if its type or properties have changed" in {
    // given
    val sensorId = 1L
    val cronExpression = "0 10 * ? * * *" // every hour at xx:10
    val workflowId = 101L
    val timeSensor = createTimeSensor(sensorId, workflowId, cronExpression)

    val changedCronExpression = "0 0 18 ? * * *" // every day at 18:00
    val changedTimeSensor = createTimeSensor(sensorId, workflowId, changedCronExpression)

    val sensorId2 = 2L
    val cronExpression2 = "0 0/10 * ? * * *" // every hour every 10 minutes
    val workflowId2 = 102L
    val timeSensor2 = createTimeSensor(sensorId2, workflowId2, cronExpression2)

    when(sensorRepository.getChangedSensors(any())(any[ExecutionContext])).thenReturn(
      Future{Seq.empty},
      Future{Seq(changedTimeSensor)}
    )
    when(sensorRepository.getInactiveSensors(any())(any[ExecutionContext])).thenReturn(Future {Seq.empty})
    when(sensorRepository.getNewActiveAssignedSensors(any(), any())(any[ExecutionContext])).thenReturn(
      Future {Seq(timeSensor, timeSensor2)},
      Future {Seq(timeSensor)}
    )
    val underTest = new Sensors(eventProcessor, sensorRepository, dagInstanceRepository, kafkaConfig)

    // when, then
    underTest.prepareSensors()
    await(underTest.processEvents(Seq(workflowId, workflowId2), firstIteration = false))
    verifyQuartzJobExists(sensorId, cronExpression)
    verifyQuartzJobExists(sensorId2, cronExpression2)
    await(underTest.processEvents(Seq(workflowId, workflowId2), firstIteration = false))
    verifyQuartzJobExists(sensorId, changedCronExpression)
    verifyQuartzJobExists(sensorId2, cronExpression2)

    underTest.cleanUpSensors()
  }

  it should "never query sensors of unassigned workflows" in {
    val baseSensor = createTimeSensor(0L, 0L, "0 0/10 * ? * * *")
    val assignedSensorsT0 = (0 to 49).map(i => baseSensor.copy(id = i, workflowId = 100 + i))
    val assignedSensorsT1 = assignedSensorsT0.filter(_.id <= 29)
    val assignedSensorsT2 = assignedSensorsT0.filter(_.id <= 39)
    val assignedWorkflowIdsT0 = assignedSensorsT0.map(_.workflowId)
    val assignedWorkflowIdsT1 = assignedSensorsT1.map(_.workflowId)
    val assignedWorkflowIdsT2 = assignedSensorsT2.map(_.workflowId)

    when(sensorRepository.getChangedSensors(any())(any[ExecutionContext])).thenReturn(Future{Seq.empty})
    when(sensorRepository.getInactiveSensors(any())(any[ExecutionContext])).thenReturn(Future {Seq.empty})
    when(sensorRepository.getNewActiveAssignedSensors(any(), any())(any[ExecutionContext])).thenReturn(
      Future {assignedSensorsT0},
      Future {Seq.empty},
      Future {assignedSensorsT2.diff(assignedSensorsT1)}
    )
    val underTest = new Sensors(eventProcessor, sensorRepository, dagInstanceRepository, kafkaConfig)

    underTest.prepareSensors()
    await(underTest.processEvents(assignedWorkflowIdsT0, firstIteration = false))
    assignedSensorsT0.map(_.id).foreach(verifyQuartzJobExists)
    verifyExactlyNQuartzJobsExist(assignedSensorsT0.size)

    await(underTest.processEvents(assignedWorkflowIdsT1, firstIteration = false))
    assignedSensorsT1.map(_.id).foreach(verifyQuartzJobExists)
    verifyExactlyNQuartzJobsExist(assignedSensorsT1.size)

    await(underTest.processEvents(assignedWorkflowIdsT2, firstIteration = false))
    assignedSensorsT2.map(_.id).foreach(verifyQuartzJobExists)
    verifyExactlyNQuartzJobsExist(assignedSensorsT2.size)
    underTest.cleanUpSensors()

    val sensorsCaptor: ArgumentCaptor[Seq[Tuple2[Long, SensorProperties]]] = ArgumentCaptor.forClass(classOf[Seq[Tuple2[Long, SensorProperties]]])
    verify(sensorRepository, times(3)).getChangedSensors(sensorsCaptor.capture())(any())
    sensorsCaptor.getAllValues.get(0) shouldBe Seq()
    sensorsCaptor.getAllValues.get(1) should contain theSameElementsAs assignedSensorsT1.map(sensor => (sensor.id, sensor.properties))
    sensorsCaptor.getAllValues.get(2) should contain theSameElementsAs assignedSensorsT1.map(sensor => (sensor.id, sensor.properties))

    val idsCaptor: ArgumentCaptor[Seq[Long]] = ArgumentCaptor.forClass(classOf[Seq[Long]])
    verify(sensorRepository, times(3)).getInactiveSensors(idsCaptor.capture())(any())
    idsCaptor.getAllValues.get(0) shouldBe Seq()
    idsCaptor.getAllValues.get(1) should contain theSameElementsAs assignedSensorsT1.map(_.id)
    idsCaptor.getAllValues.get(2) should contain theSameElementsAs assignedSensorsT1.map(_.id)

    val idsToFilterCaptor: ArgumentCaptor[Seq[Long]] = ArgumentCaptor.forClass(classOf[Seq[Long]])
    val workflowIdsCaptor: ArgumentCaptor[Seq[Long]] = ArgumentCaptor.forClass(classOf[Seq[Long]])
    verify(sensorRepository, times(3)).getNewActiveAssignedSensors(idsToFilterCaptor.capture(), workflowIdsCaptor.capture())(any())
    idsToFilterCaptor.getAllValues.get(0) shouldBe Seq()
    idsToFilterCaptor.getAllValues.get(1) should contain theSameElementsAs assignedSensorsT1.map(_.id)
    idsToFilterCaptor.getAllValues.get(2) should contain theSameElementsAs assignedSensorsT1.map(_.id)
    workflowIdsCaptor.getAllValues.get(0) should contain theSameElementsAs assignedWorkflowIdsT0
    workflowIdsCaptor.getAllValues.get(1) should contain theSameElementsAs assignedWorkflowIdsT1
    workflowIdsCaptor.getAllValues.get(2) should contain theSameElementsAs assignedWorkflowIdsT2
  }

  private def verifyExactlyNQuartzJobsExist(expectedSize: Int) = {
    val scheduler = TimeSensorQuartzSchedulerManager.getScheduler
    val jobKeys = scheduler.getJobKeys(GroupMatcher.groupEquals[JobKey](TimeSensor.JOB_GROUP_NAME))
    jobKeys.size() shouldBe expectedSize
  }

  private def verifyQuartzJobExists(sensorId: Long): Assertion = {
    val jobKey = new JobKey(sensorId.toString, TimeSensor.JOB_GROUP_NAME)
    val triggerKey = new TriggerKey(jobKey.getName, TimeSensor.JOB_TRIGGER_GROUP_NAME)
    val scheduler = TimeSensorQuartzSchedulerManager.getScheduler
    scheduler.checkExists(jobKey) shouldBe true
    scheduler.checkExists(triggerKey) shouldBe true
    scheduler.getTrigger(triggerKey) shouldBe a[CronTriggerImpl]
  }

  private def verifyQuartzJobExists(sensorId: Long, cronExpression: String): Assertion = {
    verifyQuartzJobExists(sensorId)
    val jobKey = new JobKey(sensorId.toString, TimeSensor.JOB_GROUP_NAME)
    val triggerKey = new TriggerKey(jobKey.getName, TimeSensor.JOB_TRIGGER_GROUP_NAME)
    val scheduler = TimeSensorQuartzSchedulerManager.getScheduler
    scheduler.getTrigger(triggerKey).asInstanceOf[CronTriggerImpl].getCronExpression shouldBe cronExpression
  }

  private def verifyQuartzJobNotExists(sensorId: Long)  = {
    val jobKey = new JobKey(sensorId.toString, TimeSensor.JOB_GROUP_NAME)
    val triggerKey = new TriggerKey(jobKey.getName, TimeSensor.JOB_TRIGGER_GROUP_NAME)
    val scheduler = TimeSensorQuartzSchedulerManager.getScheduler
    scheduler.checkExists(jobKey) shouldBe false
    scheduler.checkExists(triggerKey) shouldBe false
  }

  private def createTimeSensor(sensorId: Long, workflowId: Long, cronExpression: String)  = {
    Sensor(
      workflowId = workflowId,
      properties = TimeSensorProperties(
        cronExpression = cronExpression
      ),
      id = sensorId
    )
  }
}
