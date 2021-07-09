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

package za.co.absa.hyperdrive.trigger.scheduler

import java.util.concurrent
import java.util.concurrent.atomic.AtomicBoolean

import javax.inject.Inject
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import za.co.absa.hyperdrive.trigger.persistance._
import za.co.absa.hyperdrive.trigger.scheduler.cluster.{SchedulerInstanceAlreadyDeactivatedException, WorkflowBalancer}
import za.co.absa.hyperdrive.trigger.scheduler.executors.Executors
import za.co.absa.hyperdrive.trigger.scheduler.sensors.Sensors
import za.co.absa.hyperdrive.trigger.scheduler.utilities.{SchedulerConfig, SensorsConfig}

import scala.collection.mutable
import scala.concurrent.{ExecutionContext, ExecutionContextExecutor, Future}
import scala.util.{Failure, Success}

@Component
class JobScheduler @Inject()(sensors: Sensors, executors: Executors, dagInstanceRepository: DagInstanceRepository,
                             workflowBalancer: WorkflowBalancer) {

  case class RunningDagsKey(dagId: Long, workflowId: Long)

  private val logger = LoggerFactory.getLogger(this.getClass)

  private val HEART_BEAT: Int = SchedulerConfig.getHeartBeat
  val NUM_OF_PAR_TASKS: Int = SchedulerConfig.getMaxParallelJobs

  private implicit val executionContext: ExecutionContextExecutor =
    ExecutionContext.fromExecutor(concurrent.Executors.newFixedThreadPool(SensorsConfig.getThreadPoolSize))

  private val isManagerRunningAtomic = new AtomicBoolean(false)
  private var runningScheduler: Future[Unit] = Future.successful((): Unit)
  private var runningSensors = Future.successful((): Unit)
  private var runningEnqueue = Future.successful((): Unit)
  private var runningAssignWorkflows = Future.successful((): Unit)
  private val runningDags = mutable.Map.empty[RunningDagsKey, Future[Unit]]

  def startManager(): Unit = {
    logger.info("Starting Manager")
    if (!isManagerRunningAtomic.get() && runningScheduler.isCompleted) {
      isManagerRunningAtomic.set(true)
      sensors.prepareSensors()
      var firstIteration = true
      runningScheduler =
        Future {
          while (isManagerRunningAtomic.get()) {
            logger.debug("Running manager heart beat.")
            assignWorkflows(firstIteration)
            firstIteration = false
            Thread.sleep(HEART_BEAT)
          }
        }
      runningScheduler.onComplete {
        case Success(_) =>
          logger.debug("Manager stopped.")
        case Failure(exception) =>
          logger.error(s"Manager stopped with exception.", exception)
      }
    }
  }

  def stopManager(): Future[Unit] = {
    logger.info("Stopping Manager")
    isManagerRunningAtomic.set(false)
    sensors.cleanUpSensors()
    workflowBalancer.resetSchedulerInstanceId()
    runningScheduler
  }

  def isManagerRunning: Boolean = {
    !runningScheduler.isCompleted
  }

  private def assignWorkflows(firstIteration: Boolean): Unit = {
    if (runningAssignWorkflows.isCompleted) {
      runningAssignWorkflows = workflowBalancer.getAssignedWorkflows(runningDags.keys.map(_.workflowId).toSeq)
        .recover {
          case e: SchedulerInstanceAlreadyDeactivatedException =>
            logger.error("Stopping scheduler because the instance has already been deactivated", e)
            stopManager()
            throw e
        }
        .map(_.map(_.id))
        .map { assignedWorkflowIds =>
          removeFinishedDags()
          processEvents(assignedWorkflowIds, firstIteration)
          enqueueDags(assignedWorkflowIds)
        }
      runningAssignWorkflows.onComplete {
        case Success(_) =>
          logger.debug("Running assign workflows finished successfully.")
        case Failure(exception) =>
          logger.error(s"Running assign workflows finished with exception.", exception)
      }
    }
  }

  private def enqueueDags(assignedWorkflowIds: Seq[Long], emptySlotsSize: Int): Future[Unit] = {
    dagInstanceRepository.getDagsToRun(runningDags.keys.map(_.dagId).toSeq, emptySlotsSize, assignedWorkflowIds).map {
      _.foreach { dag =>
        logger.debug(s"Deploying dag = ${dag.id}")
        runningDags.put(RunningDagsKey(dag.id, dag.workflowId), executors.executeDag(dag))
      }
    }
  }

  private def removeFinishedDags(): Unit = {
    if (runningEnqueue.isCompleted) {
      runningDags.foreach {
        case (id, fut) if fut.isCompleted => runningDags.remove(id)
        case _ => ()
      }
    }
  }

  private def processEvents(assignedWorkflowIds: Seq[Long], firstIteration: Boolean): Unit = {
    if (runningSensors.isCompleted) {
      runningSensors = sensors.processEvents(assignedWorkflowIds, firstIteration)
      runningSensors.onComplete {
        case Success(_) =>
          logger.debug("Running sensors finished successfully.")
        case Failure(exception) =>
          logger.error(s"Running sensors finished with exception.", exception)
      }
    }
  }

  private def enqueueDags(assignedWorkflowIds: Seq[Long]): Unit = {
    if (runningDags.size < NUM_OF_PAR_TASKS && runningEnqueue.isCompleted) {
      runningEnqueue = enqueueDags(assignedWorkflowIds, Math.max(0, NUM_OF_PAR_TASKS - runningDags.size))
      runningEnqueue.onComplete {
        case Success(_) =>
          logger.debug("Running enqueue finished successfully.")
        case Failure(exception) =>
          logger.error(s"Running enqueue finished with exception.", exception)
      }
    }
  }

}
