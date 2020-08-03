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

package za.co.absa.hyperdrive.trigger.persistance

import java.time.LocalDateTime
import java.util.concurrent.TimeUnit

import slick.jdbc.H2Profile
import za.co.absa.hyperdrive.trigger.TestUtils
import za.co.absa.hyperdrive.trigger.models.dagRuns.DagRun
import za.co.absa.hyperdrive.trigger.models.enums.{DagInstanceStatuses, SensorTypes}
import za.co.absa.hyperdrive.trigger.models.{DagInstance, Properties, Sensor, Settings, Workflow}

import scala.concurrent.{Await, Future}
import scala.concurrent.duration._

trait RepositoryTestBase extends Repository {
  val h2Profile = H2Profile
  override val profile = h2Profile
  import profile.api._

  def h2SchemaSetup(): Unit = {
    val schema = DBIO.seq(
      workflowTable.schema.create,
      workflowHistoryTable.schema.create,
      dagDefinitionTable.schema.create,
      sensorTable.schema.create,
      jobDefinitionTable.schema.create,
      dagInstanceTable.schema.create,
      jobInstanceTable.schema.create,
      eventTable.schema.create,
      dagRunTable.schema.create
    )
    run(schema)
  }

  def h2SchemaDrop(): Unit = {
    val schema = DBIO.seq(
      eventTable.schema.drop,
      jobInstanceTable.schema.drop,
      dagInstanceTable.schema.drop,
      jobDefinitionTable.schema.drop,
      sensorTable.schema.drop,
      dagDefinitionTable.schema.drop,
      workflowTable.schema.drop,
      workflowHistoryTable.schema.drop,
      dagRunTable.schema.drop
    )
    run(schema)
  }

  def clearData(): Unit = {
    val schema = DBIO.seq(
      eventTable.delete,
      jobInstanceTable.delete,
      dagInstanceTable.delete,
      jobDefinitionTable.delete,
      sensorTable.delete,
      dagDefinitionTable.delete,
      workflowTable.delete,
      workflowHistoryTable.delete,
      dagRunTable.delete
    )
    run(schema)
  }

  def createTestData(): Unit = {
    run(workflowTable.forceInsertAll(TestData.workflows))
    run(dagInstanceTable.forceInsertAll(TestData.dagInstances))
    run(dagRunTable.forceInsertAll(TestData.dagRuns))
  }

  def insertSensors(sensorsAndWorkflows: Seq[(Sensor, Workflow)]): Unit = {
    val sensors = sensorsAndWorkflows.map{case (sensor, _) => sensor}
    val workflows = sensorsAndWorkflows.map{case (_, workflow) => workflow}.distinct
    run(workflowTable.forceInsertAll(workflows))
    run(sensorTable.forceInsertAll(sensors))
  }

  def run[R](action: DBIO[R]): Unit = {
    Await.result(db.run(action), Duration(120, TimeUnit.SECONDS))
  }

  def run[R](seqOfActions: Seq[DBIO[R]]): Unit = {
    seqOfActions.foreach(action =>  Await.result(db.run(action), Duration(120, TimeUnit.SECONDS)))
  }

  def await[T](future: Future[T]): T = {
    TestUtils.await[T](future)
  }

  object TestData {
    val w1 = Workflow(name = "workflow1", isActive = true, project = "project1", created = LocalDateTime.now(), updated = None, id = 100)
    val w2 = Workflow(name = "workflow2", isActive = true, project = "project1", created = LocalDateTime.now(), updated = None, id = 101)
    val w3 = Workflow(name = "workflow3", isActive = false, project = "project2", created = LocalDateTime.now(), updated = None, id = 102)
    val workflows: Seq[Workflow] = Seq(w1, w2, w3)

    val w1di1 = DagInstance(status = DagInstanceStatuses.InQueue, started = LocalDateTime.now(), finished = None, workflowId = w1.id, id = 200)
    val w1di2 = DagInstance(status = DagInstanceStatuses.InQueue, started = LocalDateTime.now(), finished = None, workflowId = w1.id, id = 201)
    val w1di3 = DagInstance(status = DagInstanceStatuses.Running, started = LocalDateTime.now(), finished = None, workflowId = w1.id, id = 202)
    val w1di4 = DagInstance(status = DagInstanceStatuses.Succeeded, started = LocalDateTime.now(), finished = Some(LocalDateTime.now()), workflowId = w1.id, id = 203)
    val w1di5 = DagInstance(status = DagInstanceStatuses.Failed, started = LocalDateTime.now(), finished = Some(LocalDateTime.now()), workflowId = w1.id, id = 204)
    val w2di1 = DagInstance(status = DagInstanceStatuses.InQueue, started = LocalDateTime.now(), finished = None, workflowId = w2.id, id = 205)
    val w2di2 = DagInstance(status = DagInstanceStatuses.Running, started = LocalDateTime.now(), finished = None, workflowId = w2.id, id = 206)
    val dagInstances: Seq[DagInstance] = Seq(w1di1, w1di2, w1di3, w1di4, w1di5, w2di1, w2di2)
    val runningDagInstances : Seq[DagInstance] = Seq(w1di3, w2di2)

    val dr1 = DagRun(workflowId = 1, workflowName = "workflowName1", projectName = "projectName1", jobCount = 5, started = LocalDateTime.now().plusDays(1), finished = None, status = DagInstanceStatuses.InQueue.name, id = 300)
    val dr2 = DagRun(workflowId = 2, workflowName = "workflowName2", projectName = "projectName1", jobCount = 3, started = LocalDateTime.now().plusDays(3), finished = Option(LocalDateTime.now()), status = DagInstanceStatuses.Failed.name, id = 301)
    val dr3 = DagRun(workflowId = 3, workflowName = "workflowName3", projectName = "projectName2", jobCount = 7, started = LocalDateTime.now().minusDays(2), finished = Option(LocalDateTime.now()), status = DagInstanceStatuses.Succeeded.name, id = 302)
    val dr4 = DagRun(workflowId = 4, workflowName = "workflowName4", projectName = "projectName3", jobCount = 1, started = LocalDateTime.now().minusDays(1), finished = Option(LocalDateTime.now()), status = DagInstanceStatuses.Succeeded.name, id = 303)
    val dr5 = DagRun(workflowId = 5, workflowName = "workflowName5", projectName = "projectName3", jobCount = 2, started = LocalDateTime.now().plusDays(5), finished = None, status = DagInstanceStatuses.Running.name, id = 304)
    val dagRuns: Seq[DagRun] = Seq(dr1, dr2, dr3, dr4, dr5)

  }

  object TestSensors {
    val activeTimeW100: (Sensor, Workflow) = (Sensor(TestData.w1.id, SensorTypes.Time, Properties(100L, Settings(Map.empty, Map.empty), Map.empty), 100), TestData.w1)
    val activeAbsaKafka: (Sensor, Workflow) = (Sensor(TestData.w1.id, SensorTypes.AbsaKafka, Properties(101L, Settings(Map.empty, Map.empty), Map.empty), 101), TestData.w1)
    val activeKafka: (Sensor, Workflow) = (Sensor(TestData.w2.id, SensorTypes.Kafka, Properties(102L, Settings(Map.empty, Map.empty), Map.empty), 102), TestData.w2)
    val activeTimeW101: (Sensor, Workflow) = (Sensor(TestData.w2.id, SensorTypes.Time, Properties(103L, Settings(Map.empty, Map.empty), Map.empty), 103), TestData.w2)
    val inactiveTime: (Sensor, Workflow) = (Sensor(TestData.w3.id, SensorTypes.Time, Properties(104L, Settings(Map.empty, Map.empty), Map.empty), 104), TestData.w3)
    val inactiveAbsaKafka: (Sensor, Workflow) = (Sensor(TestData.w3.id, SensorTypes.AbsaKafka, Properties(105L, Settings(Map.empty, Map.empty), Map.empty), 105), TestData.w3)
    val inactiveKafka: (Sensor, Workflow) = (Sensor(TestData.w3.id, SensorTypes.Kafka, Properties(106L, Settings(Map.empty, Map.empty), Map.empty), 106), TestData.w3)

    val allSensors: Seq[(Sensor, Workflow)] = Seq(activeTimeW100, activeAbsaKafka, activeKafka, activeTimeW101, inactiveTime, inactiveAbsaKafka, inactiveKafka)
  }

}
