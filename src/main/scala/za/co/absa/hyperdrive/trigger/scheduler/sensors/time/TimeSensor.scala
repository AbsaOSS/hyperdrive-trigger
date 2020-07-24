
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

import org.quartz.CronScheduleBuilder.cronSchedule
import org.quartz._
import za.co.absa.hyperdrive.trigger.models.{Event, Properties, Sensor}
import za.co.absa.hyperdrive.trigger.scheduler.sensors.PushSensor

import scala.concurrent.{ExecutionContext, Future}

class TimeSensor(eventsProcessor: (Seq[Event], Properties) => Future[Boolean],
                 sensorDefinition: Sensor,
                 executionContext: ExecutionContext,
                 scheduler: Scheduler
                ) extends PushSensor(eventsProcessor, sensorDefinition, executionContext) {
  private val properties = sensorDefinition.properties
  val jobKey: JobKey = new JobKey(properties.sensorId.toString, TimeSensor.JOB_GROUP_NAME)
  val jobTriggerKey: TriggerKey = new TriggerKey(jobKey.getName, TimeSensor.JOB_TRIGGER_GROUP_NAME)

  override def push: Seq[Event] => Future[Unit] = (events: Seq[Event]) =>
    eventsProcessor.apply(events, properties).map(_ => (): Unit)

  override def close(): Unit = {
    scheduler.deleteJob(jobKey)
  }

  def launchQuartzJob(cronExpression: CronExpression, sensorId: Long): Unit = {
    val jobDetail = buildJobDetail(sensorId)
    val trigger = buildJobTrigger(jobDetail, cronExpression)
    scheduler.scheduleJob(jobDetail, trigger)
  }

  private def buildJobDetail(sensorId: Long): JobDetail = {
    val jobDataMap = new JobDataMap()
    jobDataMap.put(TimeSensor.PUSH_FUNCTION_JOB_DATA_MAP_KEY, push)
    jobDataMap.put(TimeSensor.PROPERTIES_JOB_DATA_MAP_KEY, properties)
    JobBuilder.newJob(classOf[TimeSensorQuartzJob])
      .withIdentity(jobKey)
      .withDescription(s"Quartz-Job for TimeSensor (#$sensorId)")
      .usingJobData(jobDataMap)
      .storeDurably(false)
      .build
  }

  private def buildJobTrigger(jobDetail: JobDetail, cronExpression: CronExpression): Trigger = {
    TriggerBuilder.newTrigger()
      .forJob(jobDetail)
      .withIdentity(jobTriggerKey)
      .withDescription("Time Based Cron Trigger")
      .withSchedule(cronSchedule(cronExpression).withMisfireHandlingInstructionFireAndProceed())
      .startNow()
      .build()
  }
}

object TimeSensor {
  val PUSH_FUNCTION_JOB_DATA_MAP_KEY: String = "pushFunction"
  val PROPERTIES_JOB_DATA_MAP_KEY: String = "properties"

  val JOB_GROUP_NAME: String = "time-sensor-job-group"
  val JOB_TRIGGER_GROUP_NAME: String = "time-sensor-job-trigger-group"

  def apply(eventsProcessor: (Seq[Event], Properties) => Future[Boolean],
            sensorDefinition: Sensor, executionContext: ExecutionContext): TimeSensor = {
    val quartzScheduler = TimeSensorQuartzSchedulerManager.getScheduler
    val timeSensorSettings = TimeSensorSettings(sensorDefinition.properties.settings)
    val sensor = new TimeSensor(eventsProcessor, sensorDefinition, executionContext, quartzScheduler)

    val sensorId = sensorDefinition.properties.sensorId
    val cronExpression = timeSensorSettings.cronExpression

    validateJobKeys(sensor.jobKey, sensor.jobTriggerKey, quartzScheduler, sensorId)
    validateCronExpression(cronExpression, sensorId)

    sensor.launchQuartzJob(new CronExpression(cronExpression), sensorId)
    sensor
  }

  private def validateJobKeys(jobKey: JobKey, triggerKey: TriggerKey, scheduler: Scheduler, sensorId: Long): Unit = {
    if (scheduler.checkExists(jobKey)) {
      throw new IllegalArgumentException(s"A Quartz Job with key ($jobKey) already exists. Cannot create job for sensor (#$sensorId)")
    }
    if (scheduler.checkExists(triggerKey)) {
      throw new IllegalArgumentException(s"A Quartz Job-Trigger with key ($triggerKey) already exists. Cannot create job for sensor (#$sensorId)")
    }
  }

  private def validateCronExpression(cronExpression: String, sensorId: Long): Unit = {
    if (!CronExpression.isValidExpression(cronExpression)) {
      throw new IllegalArgumentException(s"Invalid cron expression $cronExpression for sensor (#$sensorId)")
    }
  }
}