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

import com.typesafe.scalalogging.LazyLogging

import java.util.Properties
import org.quartz.impl.StdSchedulerFactory
import org.quartz.{Scheduler, SchedulerException, SchedulerFactory}
import org.springframework.scheduling.SchedulingException

/**
 *  Quartz Scheduler for Time Sensors.
 */
object TimeSensorQuartzSchedulerManager extends LazyLogging {
  private val scheduler: Scheduler = initialize()

  def start(): Unit = {
    logger.info("Starting Quartz Scheduler {} now", scheduler.getSchedulerName)
    scheduler.start()
  }

  def stop(): Unit = {
    logger.info(s"Stopping Quartz Scheduler {} now", scheduler.getSchedulerName)
    try {
      scheduler.standby()
      logger.info(s"Stopped Quartz Scheduler {}", scheduler.getSchedulerName)
    } catch {
      case ex: SchedulerException => throw new SchedulingException("Could not stop Quartz Scheduler", ex)
    }
  }

  def getScheduler: Scheduler = scheduler

  private def initialize(): Scheduler = {
    logger.info("Initializing scheduler")
    val schedulerFactory = initSchedulerFactory()
    createScheduler(schedulerFactory)
  }

  private def initSchedulerFactory(): StdSchedulerFactory = {
    val schedulerFactory = new StdSchedulerFactory()
    val properties = new Properties()
    properties.put(StdSchedulerFactory.PROP_THREAD_POOL_CLASS, classOf[TimeSensorQuartzSchedulerThreadPool].getName)
    val schedulerName = "za.co.absa.hyperdrive.trigger.scheduler.sensors.time.TimeSensorQuartzScheduler"
    properties.put(StdSchedulerFactory.PROP_SCHED_INSTANCE_NAME, schedulerName)
    schedulerFactory.initialize(properties)
    schedulerFactory
  }

  private def createScheduler(schedulerFactory: SchedulerFactory) = schedulerFactory.getScheduler
}
