
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

import java.util.concurrent

import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.{reset, when}
import org.quartz.impl.triggers.CronTriggerImpl
import org.quartz.{JobKey, TriggerKey}
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{BeforeAndAfter, FlatSpec, Matchers}
import za.co.absa.hyperdrive.trigger.TestUtils.await
import za.co.absa.hyperdrive.trigger.models._
import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes
import za.co.absa.hyperdrive.trigger.persistance.SensorRepository
import za.co.absa.hyperdrive.trigger.scheduler.eventProcessor.EventProcessor
import za.co.absa.hyperdrive.trigger.scheduler.sensors.Sensors

import scala.concurrent.{ExecutionContext, ExecutionContextExecutor, Future}

class SensorsTest extends FlatSpec with MockitoSugar with Matchers with BeforeAndAfter {
  private implicit val executionContext: ExecutionContextExecutor =
    ExecutionContext.fromExecutor(concurrent.Executors.newSingleThreadExecutor())
  private val sensorRepository = mock[SensorRepository]
  private val eventProcessor = mock[EventProcessor]

  before {
    reset(sensorRepository)
    reset(eventProcessor)
  }

  "Sensors.processEvents" should "add a new time sensor" in {
    // given
    val sensorId = 1
    val cronExpression = "0 10 * ? * * *" // every hour at xx:10
    val timeSensor = createTimeSensor(sensorId, cronExpression)

    when(sensorRepository.getChangedSensors(any())(any[ExecutionContext])).thenReturn(Future{Seq.empty})
    when(sensorRepository.getInactiveSensors(any())(any[ExecutionContext])).thenReturn(Future{Seq.empty})
    when(sensorRepository.getNewActiveSensors(any())(any[ExecutionContext])).thenReturn(Future{Seq(timeSensor)})

    val underTest = new Sensors(eventProcessor, sensorRepository)

    // when
    underTest.prepareSensors()
    await(underTest.processEvents())

    verifyQuartzJobExists(sensorId, cronExpression)

    underTest.cleanUpSensors()
  }

  it should "remove an inactive sensor" in {
    // given
    val sensorId = 1L
    val cronExpression = "0 10 * ? * * *" // every hour at xx:10
    val timeSensor = createTimeSensor(sensorId, cronExpression)

    val sensorId2 = 2L
    val cronExpression2 = "0 0/10 * ? * * *" // every hour every 10 minutes
    val timeSensor2 = createTimeSensor(sensorId2, cronExpression2)

    when(sensorRepository.getChangedSensors(any())(any[ExecutionContext])).thenReturn(Future{Seq.empty})
    when(sensorRepository.getInactiveSensors(any())(any[ExecutionContext])).thenReturn(
      Future {Seq.empty[Long]},
      Future {Seq(sensorId)}
    )
    when(sensorRepository.getNewActiveSensors(any())(any[ExecutionContext])).thenReturn(
      Future {Seq(timeSensor, timeSensor2)},
      Future {Seq.empty}
    )
    val underTest = new Sensors(eventProcessor, sensorRepository)

    // when, then
    underTest.prepareSensors()
    await(underTest.processEvents())
    verifyQuartzJobExists(sensorId, cronExpression)
    verifyQuartzJobExists(sensorId2, cronExpression2)

    await(underTest.processEvents())
    verifyQuartzJobNotExists(sensorId)
    verifyQuartzJobExists(sensorId2, cronExpression2)

    underTest.cleanUpSensors()
  }

  it should "add a newly activated sensor" in {
    // given
    val sensorId = 1L
    val cronExpression = "0 10 * ? * * *" // every hour at xx:10
    val timeSensor = createTimeSensor(sensorId, cronExpression)

    val sensorId2 = 2L
    val cronExpression2 = "0 0/10 * ? * * *" // every hour every 10 minutes
    val timeSensor2 = createTimeSensor(sensorId2, cronExpression2)

    val sensorId3 = 3L
    val cronExpression3 = "0 0 18 ? * * *" // every day at 18:00
    val timeSensor3 = createTimeSensor(sensorId3, cronExpression3)

    when(sensorRepository.getChangedSensors(any())(any[ExecutionContext])).thenReturn(Future{Seq.empty})
    when(sensorRepository.getInactiveSensors(any())(any[ExecutionContext])).thenReturn(
      Future {Seq.empty},
      Future {Seq(sensorId, sensorId2)},
      Future {Seq(sensorId3)}
    )
    when(sensorRepository.getNewActiveSensors(any())(any[ExecutionContext])).thenReturn(
      Future {Seq(timeSensor, timeSensor2)},
      Future {Seq(timeSensor3)},
      Future {Seq(timeSensor)}
    )
    val underTest = new Sensors(eventProcessor, sensorRepository)

    // when, then
    underTest.prepareSensors()
    await(underTest.processEvents())
    verifyQuartzJobExists(sensorId, cronExpression)
    verifyQuartzJobExists(sensorId2, cronExpression2)
    await(underTest.processEvents())
    verifyQuartzJobNotExists(sensorId)
    verifyQuartzJobNotExists(sensorId2)
    verifyQuartzJobExists(sensorId3, cronExpression3)

    await(underTest.processEvents())
    verifyQuartzJobExists(sensorId, cronExpression)
    verifyQuartzJobNotExists(sensorId3)

    underTest.cleanUpSensors()
  }

  it should "update a time sensor if its type or properties have changed" in {
    // given
    val sensorId = 1L
    val cronExpression = "0 10 * ? * * *" // every hour at xx:10
    val timeSensor = createTimeSensor(sensorId, cronExpression)

    val changedCronExpression = "0 0 18 ? * * *" // every day at 18:00
    val changedTimeSensor = createTimeSensor(sensorId, changedCronExpression)

    val sensorId2 = 2L
    val cronExpression2 = "0 0/10 * ? * * *" // every hour every 10 minutes
    val timeSensor2 = createTimeSensor(sensorId2, cronExpression2)

    when(sensorRepository.getChangedSensors(any())(any[ExecutionContext])).thenReturn(
      Future{Seq.empty},
      Future{Seq(changedTimeSensor)}
    )
    when(sensorRepository.getInactiveSensors(any())(any[ExecutionContext])).thenReturn(Future {Seq.empty})
    when(sensorRepository.getNewActiveSensors(any())(any[ExecutionContext])).thenReturn(
      Future {Seq(timeSensor, timeSensor2)},
      Future {Seq(timeSensor)}
    )
    val underTest = new Sensors(eventProcessor, sensorRepository)

    // when, then
    underTest.prepareSensors()
    await(underTest.processEvents())
    verifyQuartzJobExists(sensorId, cronExpression)
    verifyQuartzJobExists(sensorId2, cronExpression2)
    await(underTest.processEvents())
    verifyQuartzJobExists(sensorId, changedCronExpression)
    verifyQuartzJobExists(sensorId2, cronExpression2)

    underTest.cleanUpSensors()
  }

  private def verifyQuartzJobExists(sensorId: Long, cronExpression: String)  = {
    val jobKey = new JobKey(sensorId.toString, TimeSensor.JOB_GROUP_NAME)
    val triggerKey = new TriggerKey(jobKey.getName, TimeSensor.JOB_TRIGGER_GROUP_NAME)
    val scheduler = TimeSensorQuartzSchedulerManager.getScheduler
    scheduler.checkExists(jobKey) shouldBe true
    scheduler.checkExists(triggerKey) shouldBe true
    scheduler.getTrigger(triggerKey) shouldBe a[CronTriggerImpl]
    scheduler.getTrigger(triggerKey).asInstanceOf[CronTriggerImpl].getCronExpression shouldBe cronExpression
  }

  private def verifyQuartzJobNotExists(sensorId: Long)  = {
    val jobKey = new JobKey(sensorId.toString, TimeSensor.JOB_GROUP_NAME)
    val triggerKey = new TriggerKey(jobKey.getName, TimeSensor.JOB_TRIGGER_GROUP_NAME)
    val scheduler = TimeSensorQuartzSchedulerManager.getScheduler
    scheduler.checkExists(jobKey) shouldBe false
    scheduler.checkExists(triggerKey) shouldBe false
  }

  private def createTimeSensor(sensorId: Long, cronExpression: String)  = {
    Sensor(
      sensorType = SensorTypes.Time,
      properties = Properties(
        settings = Settings(
          variables = Map("cronExpression" -> cronExpression),
          maps = Map()),
        matchProperties = Map(),
        sensorId = sensorId
      ),
      id = sensorId
    )
  }
}
