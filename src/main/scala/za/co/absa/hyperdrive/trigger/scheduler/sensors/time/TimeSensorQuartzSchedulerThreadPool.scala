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

import java.util.concurrent.atomic.AtomicInteger
import java.util.concurrent.{Executors, RejectedExecutionException, ThreadFactory, ThreadPoolExecutor}
import org.quartz.spi.ThreadPool

/**
 *  Thread Pool for Quartz Scheduler based on org.springframework.scheduling.quartz.LocalTaskExecutorThreadPool
 */
class TimeSensorQuartzSchedulerThreadPool extends ThreadPool with LazyLogging {

  private val fixedPoolSize = 10
  private val taskExecutor = createTaskExecutor

  override def setInstanceId(schedInstId: String): Unit = {}
  override def setInstanceName(schedName: String): Unit = {}
  override def initialize(): Unit = {}
  override def shutdown(waitForJobsToComplete: Boolean): Unit = {}
  override def getPoolSize: Int = taskExecutor.getPoolSize

  override def runInThread(runnable: Runnable): Boolean = {
    Predef.assert(this.taskExecutor != null, "No TaskExecutor available")
    try {
      logger.debug("Trying to spawn new thread for runnable")
      this.taskExecutor.execute(runnable)
      true
    } catch {
      case ex: RejectedExecutionException =>
        logger.error("Task has been rejected by TaskExecutor", ex)
        false
    }
  }

  override def blockForAvailableThreads: Int =
    taskExecutor.getMaximumPoolSize - taskExecutor.getActiveCount

  private def createTaskExecutor: ThreadPoolExecutor = {
    val threadFactory = new CustomThreadGroupThreadFactory("TimeSensorQuartzThreadGroup", "TimeSensorQuartz")
    Executors.newFixedThreadPool(fixedPoolSize, threadFactory).asInstanceOf[ThreadPoolExecutor]
  }

  /**
   *  ThreadFactory based on [[java.util.concurrent.Executors.DefaultThreadFactory]] which allows to set a custom
   *  thread group and thread name prefix
   *
   *  @param threadGroupName
   *   name of custom thread group
   *  @param threadNamePrefix
   *   prefix for threads of this thread group
   */
  class CustomThreadGroupThreadFactory(val threadGroupName: String, val threadNamePrefix: String)
      extends ThreadFactory with LazyLogging {
    Predef.assert(threadGroupName != null)
    Predef.assert(threadNamePrefix != null)
    private val threadNumber = new AtomicInteger(1)

    val s: SecurityManager = System.getSecurityManager
    private val group = {
      if (threadGroupName.nonEmpty) {
        logger.trace("Getting thread group for threadGroupName: group={}", threadGroupName)
        new ThreadGroup(threadGroupName)
      }
      else if (s != null) {
        logger.trace("Getting thread group from security manager: group={}", s.getThreadGroup.getName)
        s.getThreadGroup
      }
      else {
        logger.trace("Getting thread group of current thread: group={}", Thread.currentThread().getThreadGroup.getName)
        Thread.currentThread.getThreadGroup
      }
    }

    private val namePrefix = s"$threadNamePrefix-thread-"

    override def newThread(r: Runnable): Thread = {
      logger.debug("Creating new thread for runnable")
      val t = new Thread(group, r, namePrefix + threadNumber.getAndIncrement, 0)
      if (t.isDaemon) {
        logger.trace("Spawning normal thread from daemon for runnable")
        t.setDaemon(false)
      }
      if (t.getPriority != Thread.NORM_PRIORITY) {
        logger.trace("Setting priority to Thread.NORM_PRIORITY")
        t.setPriority(Thread.NORM_PRIORITY)
      }
      t
    }
  }
}
