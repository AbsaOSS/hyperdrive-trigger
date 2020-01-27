
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

import java.util.concurrent.atomic.AtomicInteger
import java.util.concurrent.{Executors, RejectedExecutionException, ThreadFactory, ThreadPoolExecutor}

import org.quartz.spi.ThreadPool
import org.slf4j.LoggerFactory

/**
 * Thread Pool for Quartz Scheduler based on org.springframework.scheduling.quartz.LocalTaskExecutorThreadPool
 */
class TimeSensorQuartzSchedulerThreadPool extends ThreadPool {

  private val logger = LoggerFactory.getLogger(this.getClass)
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
   * ThreadFactory based on {@link java.util.concurrent.Executors.DefaultThreadFactory} which allows to set a custom
   * thread group and thread name prefix
   *
   * @param threadGroupName name of custom thread group
   * @param threadNamePrefix prefix for threads of this thread group
   */
  class CustomThreadGroupThreadFactory(val threadGroupName: String, val threadNamePrefix: String) extends ThreadFactory {
    Predef.assert(threadGroupName != null)
    Predef.assert(threadNamePrefix != null)
    private val threadNumber = new AtomicInteger(1)

    val s: SecurityManager = System.getSecurityManager
    private val group = {
      if (threadGroupName.nonEmpty) new ThreadGroup(threadGroupName)
      else if (s != null) s.getThreadGroup
      else Thread.currentThread.getThreadGroup
    }

    private val namePrefix = s"$threadNamePrefix-thread-"

    override def newThread(r: Runnable): Thread = {
      val t = new Thread(group, r, namePrefix + threadNumber.getAndIncrement, 0)
      if (t.isDaemon) t.setDaemon(false)
      if (t.getPriority != Thread.NORM_PRIORITY) t.setPriority(Thread.NORM_PRIORITY)
      t
    }
  }
}
