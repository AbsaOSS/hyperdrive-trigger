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

package za.co.absa.hyperdrive.trigger.scheduler

import java.util.concurrent
import java.util.concurrent.atomic.AtomicBoolean

import javax.inject.Inject
import za.co.absa.hyperdrive.trigger.persistance._
import za.co.absa.hyperdrive.trigger.scheduler.executors.Executors
import za.co.absa.hyperdrive.trigger.scheduler.sensors.Sensors
import za.co.absa.hyperdrive.trigger.scheduler.utilities.{SchedulerConfig, SensorsConfig}

import scala.collection.mutable
import scala.concurrent.{ExecutionContext, ExecutionContextExecutor, Future}
import scala.util.{Failure, Success}
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import za.co.absa.hyperdrive.trigger.scheduler.sensors.time.TimeSensorQuartzSchedulerManager

@Component
class JobScheduler @Inject()(sensors: Sensors, executors: Executors, dagInstanceRepository: DagInstanceRepository) {
  private val logger = LoggerFactory.getLogger(this.getClass)

  private val HEART_BEAT: Int = SchedulerConfig.getHeartBeat
  val NUM_OF_PAR_TASKS: Int = SchedulerConfig.getMaxParallelJobs

  private implicit val executionContext: ExecutionContextExecutor =
    ExecutionContext.fromExecutor(concurrent.Executors.newFixedThreadPool(SensorsConfig.getThreadPoolSize))

  private val isManagerRunningAtomic = new AtomicBoolean(false)
  private var runningScheduler: Future[Unit] = Future.successful((): Unit)
  private var runningSensors = Future.successful((): Unit)
  private var runningEnqueue = Future.successful((): Unit)
  private val runningDags = mutable.Map.empty[Long, Future[Unit]]

  def startManager(): Unit = {
    if(!isManagerRunningAtomic.get() && runningScheduler.isCompleted) {
      TimeSensorQuartzSchedulerManager.start()
      isManagerRunningAtomic.set(true)
      runningScheduler =
        Future {
          while (isManagerRunningAtomic.get()) {
            logger.debug("Running manager heart beat.")
            removeFinishedDags()
            processEvents()
            enqueueDags()
            Thread.sleep(HEART_BEAT)
          }
        }
      runningScheduler.onComplete {
        case Success(_) =>
          logger.debug("Manager stopped.")
        case Failure(exception) =>
          logger.debug(s"Manager stopped with exception.", exception)
      }
    }
  }

  def stopManager(): Future[Unit] = {
    isManagerRunningAtomic.set(false)
    sensors.stopAllSensors()
    TimeSensorQuartzSchedulerManager.stop()
    runningScheduler
  }

  def isManagerRunning: Boolean = {
    !runningScheduler.isCompleted
  }

  private def enqueueDags(emptySlotsSize: Int): Future[Unit] = {
    dagInstanceRepository.getDagsToRun(runningDags.keys.toSeq, emptySlotsSize).map {
      _.foreach { dag =>
        logger.debug(s"Deploying dag = ${dag.id}")
        runningDags.put(dag.id, executors.executeDag(dag))
      }
    }
  }

  private def removeFinishedDags(): Unit = {
    if(runningEnqueue.isCompleted){
      runningDags.foreach {
        case (id, fut) if fut.isCompleted => runningDags.remove(id)
        case _ => ()
      }
    }
  }

  private def processEvents(): Unit = {
    if(runningSensors.isCompleted){
      runningSensors = sensors.processEvents()
      runningSensors.onComplete {
        case Success(_) =>
          logger.debug("Running sensors finished successfully.")
        case Failure(exception) =>
          logger.debug(s"Running sensors finished with exception.", exception)
      }
    }
  }

  private def enqueueDags(): Unit = {
    if(runningDags.size < NUM_OF_PAR_TASKS && runningEnqueue.isCompleted){
      runningEnqueue = enqueueDags(Math.max(0, NUM_OF_PAR_TASKS - runningDags.size))
      runningEnqueue.onComplete {
        case Success(_) =>
          logger.debug("Running enqueue finished successfully.")
        case Failure(exception) =>
          logger.debug(s"Running enqueue finished with exception.", exception)
      }
    }
  }

}