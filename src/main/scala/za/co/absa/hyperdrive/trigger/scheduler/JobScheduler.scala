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

import com.typesafe.scalalogging.LazyLogging

import java.util.concurrent
import java.util.concurrent.atomic.AtomicBoolean
import javax.inject.Inject
import org.springframework.stereotype.Component
import za.co.absa.hyperdrive.trigger.configuration.application.SchedulerConfig
import za.co.absa.hyperdrive.trigger.persistance._
import za.co.absa.hyperdrive.trigger.scheduler.cluster.{SchedulerInstanceAlreadyDeactivatedException, WorkflowBalancer}
import za.co.absa.hyperdrive.trigger.scheduler.executors.Executors
import za.co.absa.hyperdrive.trigger.scheduler.notifications.NotificationSender
import za.co.absa.hyperdrive.trigger.scheduler.sensors.Sensors

import scala.collection.concurrent.{Map => ConcurrentMap, TrieMap}
import scala.concurrent.{ExecutionContext, ExecutionContextExecutor, Future}
import scala.util.{Failure, Success}

@Component
class JobScheduler @Inject() (
  sensors: Sensors,
  executors: Executors,
  dagInstanceRepository: DagInstanceRepository,
  workflowBalancer: WorkflowBalancer,
  notificationSender: NotificationSender,
  schedulerConfig: SchedulerConfig
) extends LazyLogging {

  case class RunningDagsKey(dagId: Long, workflowId: Long)

  private val HEART_BEAT: Int = schedulerConfig.heartBeat
  val NUM_OF_PAR_TASKS: Int = schedulerConfig.maxParallelJobs

  private implicit val executionContext: ExecutionContextExecutor =
    ExecutionContext.fromExecutor(concurrent.Executors.newFixedThreadPool(schedulerConfig.sensors.threadPoolSize))

  private val isManagerRunningAtomic = new AtomicBoolean(false)
  private var runningScheduler: Future[Unit] = Future.successful((): Unit)
  private var runningSensors = Future.successful((): Unit)
  private var runningEnqueue = Future.successful((): Unit)
  private var runningAssignWorkflows = Future.successful((): Unit)
  private var runningSendingNotifications = Future.successful((): Unit)
  private val runningDags: ConcurrentMap[RunningDagsKey, Future[Unit]] = TrieMap.empty

  def startManager(): Unit = {
    logger.info("Starting Manager")
    if (!isManagerRunningAtomic.get() && runningScheduler.isCompleted) {
      isManagerRunningAtomic.set(true)
      sensors.prepareSensors()
      runningScheduler = Future {
        while (isManagerRunningAtomic.get()) {
          logger.info("Running manager heart beat.")
          assignWorkflows()
          sendNotifications()
          Thread.sleep(HEART_BEAT)
        }
      }
      runningScheduler.onComplete {
        case Success(_) =>
          logger.info("Manager stopped.")
        case Failure(exception) =>
          logger.error(s"Manager stopped with exception.", exception)
      }
    }
  }

  def stopManager(): Future[Unit] = {
    logger.info("Stopping Manager")
    isManagerRunningAtomic.set(false)
    cleanUp()
    runningScheduler
  }

  def isManagerRunning: Boolean =
    !runningScheduler.isCompleted

  private def assignWorkflows(): Unit =
    if (runningAssignWorkflows.isCompleted) {
      runningAssignWorkflows = workflowBalancer
        .getAssignedWorkflows(runningDags.keys.map(_.workflowId).toSeq)
        .recover { case e: SchedulerInstanceAlreadyDeactivatedException =>
          logger.warn("Restarting scheduler because the instance has been deactivated by other instance", e)
          cleanUp()
          sensors.prepareSensors()
          throw e
        }
        .map(_.map(_.id))
        .map { assignedWorkflowIds =>
          removeFinishedDags()
          processEvents(assignedWorkflowIds)
          enqueueDags(assignedWorkflowIds)
        }
      runningAssignWorkflows.onComplete {
        case Success(_) =>
          logger.debug("Running assign workflows finished successfully.")
        case Failure(exception) =>
          logger.error(s"Running assign workflows finished with exception.", exception)
      }
    }

  private def enqueueDags(assignedWorkflowIds: Seq[Long], emptySlotsSize: Int): Future[Unit] =
    dagInstanceRepository
      .getDagsToRun(runningDags.keys.map(_.workflowId).toSeq.distinct, emptySlotsSize, assignedWorkflowIds)
      .map {
        _.foreach { dag =>
          logger.debug("Deploying dag (DagId={})", dag.id)
          runningDags.put(RunningDagsKey(dag.id, dag.workflowId), executors.executeDag(dag))
        }
      }

  private def removeFinishedDags(): Unit =
    if (runningEnqueue.isCompleted) {
      val finishedDags = runningDags.flatMap {
        case (key, dagCompletion) if dagCompletion.isCompleted => Some(key)
        case _                                                 => None
      }.toSeq
      logger.debug(
        "Removing finished DAGs for workflows {}",
        finishedDags.map(k => s"(DagId=${k.dagId}, WorkflowId=${k.workflowId})")
      )
      runningDags --= finishedDags
    }

  private def processEvents(assignedWorkflowIds: Seq[Long]): Unit =
    if (runningSensors.isCompleted) {
      runningSensors = sensors.processEvents(assignedWorkflowIds)
      runningSensors.onComplete {
        case Success(_) =>
          logger.debug("Running sensors finished successfully.")
        case Failure(exception) =>
          logger.error(s"Running sensors finished with exception.", exception)
      }
    }

  private def enqueueDags(assignedWorkflowIds: Seq[Long]): Unit =
    if (runningDags.size < NUM_OF_PAR_TASKS && runningEnqueue.isCompleted) {
      runningEnqueue = enqueueDags(assignedWorkflowIds, Math.max(0, NUM_OF_PAR_TASKS - runningDags.size))
      runningEnqueue.onComplete {
        case Success(_) =>
          logger.debug("Running enqueue finished successfully.")
        case Failure(exception) =>
          logger.error(s"Running enqueue finished with exception.", exception)
      }
    }

  private def sendNotifications(): Unit =
    if (runningSendingNotifications.isCompleted) {
      runningSendingNotifications = Future(notificationSender.sendNotifications())
      runningSendingNotifications.onComplete {
        case Success(_) =>
          logger.debug("Running sending notifications finished successfully.")
        case Failure(exception) =>
          logger.error(s"Running sending notifications finished with exception.", exception)
      }
    }

  private def cleanUp(): Unit = {
    sensors.cleanUpSensors()
    workflowBalancer.resetSchedulerInstanceId()
  }
}
