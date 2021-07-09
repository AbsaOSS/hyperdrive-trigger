
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

import za.co.absa.hyperdrive.trigger.TestUtils
import za.co.absa.hyperdrive.trigger.models.{AbsaKafkaSensorProperties, DagDefinition, DagDefinitionJoined, DagInstance, JobDefinition, JobTemplate, KafkaSensorProperties, NotificationRule, SchedulerInstance, Sensor, ShellTemplateParameters, SparkDefinitionParameters, SparkTemplateParameters, TimeSensorProperties, Workflow, WorkflowJoined}
import za.co.absa.hyperdrive.trigger.models.dagRuns.DagRun
import za.co.absa.hyperdrive.trigger.models.enums.{DagInstanceStatuses, SchedulerInstanceStatuses}

import java.time.LocalDateTime
import java.util.concurrent.TimeUnit
import scala.concurrent.{Await, Future}
import scala.concurrent.duration.Duration

trait RepositoryTestBase extends Repository {

  import api._
  def schemaSetup(): Unit = {
    val schema = DBIO.seq(
      schedulerInstanceTable.schema.create,
      workflowTable.schema.create,
      workflowHistoryTable.schema.create,
      dagDefinitionTable.schema.create,
      sensorTable.schema.create,
      jobTemplateTable.schema.create,
      jobDefinitionTable.schema.create,
      dagInstanceTable.schema.create,
      jobInstanceTable.schema.create,
      eventTable.schema.create,
      dagRunTable.schema.create,
      notificationRuleTable.schema.create,
      notificationRuleHistoryTable.schema.create
    )
    run(schema)
  }

  def schemaDrop(): Unit = {
    val schema = DBIO.seq(
      dagRunTable.schema.dropIfExists,
      eventTable.schema.drop,
      jobInstanceTable.schema.drop,
      dagInstanceTable.schema.drop,
      jobDefinitionTable.schema.drop,
      jobTemplateTable.schema.drop,
      sensorTable.schema.drop,
      dagDefinitionTable.schema.drop,
      workflowTable.schema.drop,
      workflowHistoryTable.schema.drop,
      schedulerInstanceTable.schema.drop,
      notificationRuleTable.schema.drop,
      notificationRuleHistoryTable.schema.drop
    )
    run(schema)
  }

  def clearData(): Unit = {
    val schema = DBIO.seq(
      eventTable.delete,
      jobInstanceTable.delete,
      dagInstanceTable.delete,
      jobDefinitionTable.delete,
      jobTemplateTable.delete,
      sensorTable.delete,
      dagDefinitionTable.delete,
      workflowTable.delete,
      workflowHistoryTable.delete,
      dagRunTable.delete,
      schedulerInstanceTable.delete,
      notificationRuleTable.delete,
      notificationRuleHistoryTable.delete
    )
    run(schema)
  }

  def createTestData(): Unit = {
    run(workflowTable.forceInsertAll(TestData.workflows))
    run(dagInstanceTable.forceInsertAll(TestData.dagInstances))
    run(dagRunTable.forceInsertAll(TestData.dagRuns))
    run(sensorTable.forceInsertAll(TestSensors.allSensors.map(_._1)))
    run(jobTemplateTable.forceInsertAll(TestData.jobTemplates))
    run(dagDefinitionTable.forceInsertAll(TestData.dagDefinitions))
    run(jobDefinitionTable.forceInsertAll(TestData.jobDefinitions))
  }

  def insertSensors(sensorsAndWorkflows: Seq[(Sensor, Workflow)]): Unit = {
    val sensors = sensorsAndWorkflows.map{case (sensor, _) => sensor}
    val workflows = sensorsAndWorkflows.map{case (_, workflow) => workflow}.distinct
    run(workflowTable.forceInsertAll(workflows))
    run(sensorTable.forceInsertAll(sensors))
  }

  def insertJobTemplates(): Unit = {
    run(jobTemplateTable.forceInsertAll(TestData.jobTemplates))
  }

  def insertSchedulerInstances(): Unit = {
    run(schedulerInstanceTable.forceInsertAll(TestData.schedulerInstances))
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
    val triggeredBy = "Triggered by"

    val w1 = Workflow(name = "workflow1", isActive = true, project = "project1", created = LocalDateTime.now(), updated = None, id = 100)
    val w2 = Workflow(name = "workflow2", isActive = true, project = "project1", created = LocalDateTime.now(), updated = None, id = 101)
    val w3 = Workflow(name = "workflow3", isActive = true, project = "project2", created = LocalDateTime.now(), updated = None, id = 102)
    val w4 = Workflow(name = "workflow4", isActive = true, project = "project2", created = LocalDateTime.now(), updated = None, id = 103)
    val w5 = Workflow(name = "workflow5", isActive = false, project = "project2", created = LocalDateTime.now(), updated = None, id = 104)
    val w6 = Workflow(name = "workflow6", isActive = false, project = "project2", created = LocalDateTime.now(), updated = None, id = 105)
    val w7 = Workflow(name = "workflow7", isActive = false, project = "project2", created = LocalDateTime.now(), updated = None, id = 106)

    val workflows: Seq[Workflow] = Seq(w1, w2, w3, w4, w5, w6, w7)

    val w1di1 = DagInstance(status = DagInstanceStatuses.InQueue, triggeredBy = triggeredBy, started = LocalDateTime.now(), finished = None, workflowId = w1.id, id = 200)
    val w1di2 = DagInstance(status = DagInstanceStatuses.InQueue, triggeredBy = triggeredBy, started = LocalDateTime.now(), finished = None, workflowId = w1.id, id = 201)
    val w1di3 = DagInstance(status = DagInstanceStatuses.Running, triggeredBy = triggeredBy, started = LocalDateTime.now(), finished = None, workflowId = w1.id, id = 202)
    val w1di4 = DagInstance(status = DagInstanceStatuses.Succeeded, triggeredBy = triggeredBy, started = LocalDateTime.now(), finished = Some(LocalDateTime.now()), workflowId = w1.id, id = 203)
    val w1di5 = DagInstance(status = DagInstanceStatuses.Failed, triggeredBy = triggeredBy, started = LocalDateTime.now(), finished = Some(LocalDateTime.now()), workflowId = w1.id, id = 204)
    val w2di1 = DagInstance(status = DagInstanceStatuses.InQueue, triggeredBy = triggeredBy, started = LocalDateTime.now(), finished = None, workflowId = w2.id, id = 205)
    val w2di2 = DagInstance(status = DagInstanceStatuses.Running, triggeredBy = triggeredBy, started = LocalDateTime.now(), finished = None, workflowId = w2.id, id = 206)
    val dagInstances: Seq[DagInstance] = Seq(w1di1, w1di2, w1di3, w1di4, w1di5, w2di1, w2di2)
    val runningDagInstances : Seq[DagInstance] = Seq(w1di3, w2di2)

    val dr1 = DagRun(workflowId = 1, workflowName = "workflowName1", projectName = "projectName1", jobCount = 5, started = LocalDateTime.now().plusDays(1), finished = None, status = DagInstanceStatuses.InQueue.name, triggeredBy = triggeredBy, id = 300)
    val dr2 = DagRun(workflowId = 2, workflowName = "workflowName2", projectName = "projectName1", jobCount = 3, started = LocalDateTime.now().plusDays(3), finished = Option(LocalDateTime.now()), status = DagInstanceStatuses.Failed.name, triggeredBy = triggeredBy, id = 301)
    val dr3 = DagRun(workflowId = 3, workflowName = "workflowName3", projectName = "projectName2", jobCount = 7, started = LocalDateTime.now().minusDays(2), finished = Option(LocalDateTime.now()), status = DagInstanceStatuses.Succeeded.name, triggeredBy = triggeredBy, id = 302)
    val dr4 = DagRun(workflowId = 4, workflowName = "workflowName4", projectName = "projectName3", jobCount = 1, started = LocalDateTime.now().minusDays(1), finished = Option(LocalDateTime.now()), status = DagInstanceStatuses.Succeeded.name, triggeredBy = triggeredBy, id = 303)
    val dr5 = DagRun(workflowId = 5, workflowName = "workflowName5", projectName = "projectName3", jobCount = 2, started = LocalDateTime.now().plusDays(5), finished = None, status = DagInstanceStatuses.Running.name, triggeredBy = triggeredBy, id = 304)
    val dagRuns: Seq[DagRun] = Seq(dr1, dr2, dr3, dr4, dr5)

    val jt1 = JobTemplate(name = "jobTemplate1", SparkTemplateParameters(jobJar = None, mainClass = None, appArguments = List("value1", "value2"), additionalJars = List("value1", "value2"), additionalFiles = List("value1", "value2"), additionalSparkConfig = Map("key" -> "value")), id = 100, formConfig = "Spark")
    val jt2 = JobTemplate(name = "jobTemplate2", ShellTemplateParameters(scriptLocation = None), id = 101, formConfig = "Shell")
    val jobTemplates = Seq(jt1, jt2)

    val dd1 = DagDefinition(workflowId = w1.id, id = 400)
    val dd2 = DagDefinition(workflowId = w2.id, id = 401)
    val dd3 = DagDefinition(workflowId = w3.id, id = 402)
    val dd4 = DagDefinition(workflowId = w4.id, id = 403)
    val dd5 = DagDefinition(workflowId = w5.id, id = 404)
    val dd6 = DagDefinition(workflowId = w6.id, id = 405)
    val dd7 = DagDefinition(workflowId = w7.id, id = 406)
    val dagDefinitions = Seq(dd1, dd2, dd3, dd4, dd5, dd6, dd7)

    val genericJd = JobDefinition(dagDefinitionId = -1, jobTemplateId = -1, name = "generic", jobParameters = SparkDefinitionParameters(jobJar = None, mainClass = None), order = 1, id = -1)
    val jd1dd1 = genericJd.copy(dagDefinitionId = 400, jobTemplateId = 100, name = "jd1dd1", order = 1, id = 501)
    val jd2dd1 = genericJd.copy(dagDefinitionId = 400, jobTemplateId = 101, name = "jd2dd1", order = 2, id = 502)
    val jd1dd2 = genericJd.copy(dagDefinitionId = 401, jobTemplateId = 101, name = "jd1dd2", order = 1, id = 503)
    val jd1dd3 = genericJd.copy(dagDefinitionId = 402, jobTemplateId = 101, name = "jd1dd3", order = 1, id = 504)
    val jd1dd4 = genericJd.copy(dagDefinitionId = 403, jobTemplateId = 101, name = "jd1dd4", order = 1, id = 505)
    val jd1dd5 = genericJd.copy(dagDefinitionId = 404, jobTemplateId = 101, name = "jd1dd5", order = 1, id = 506)
    val jd1dd6 = genericJd.copy(dagDefinitionId = 405, jobTemplateId = 101, name = "jd1dd6", order = 1, id = 507)
    val jd1dd7 = genericJd.copy(dagDefinitionId = 406, jobTemplateId = 101, name = "jd1dd7", order = 1, id = 508)

    val jobDefinitions = Seq(jd1dd1, jd2dd1, jd1dd2, jd1dd3, jd1dd4, jd1dd5, jd1dd6, jd1dd7)

    val schedulerInstances = Seq(
      SchedulerInstance(11L, SchedulerInstanceStatuses.Active, LocalDateTime.of(2020, 1, 1, 2, 30, 28)),
      SchedulerInstance(12L, SchedulerInstanceStatuses.Active, LocalDateTime.of(2020, 1, 1, 2, 30, 31)),
      SchedulerInstance(13L, SchedulerInstanceStatuses.Active, LocalDateTime.of(2020, 1, 1, 2, 30, 25)),
      SchedulerInstance(21L, SchedulerInstanceStatuses.Active, LocalDateTime.of(2020, 1, 1, 2, 30, 5)),
      SchedulerInstance(22L, SchedulerInstanceStatuses.Active, LocalDateTime.of(2020, 1, 1, 2, 29, 55)),
      SchedulerInstance(31L, SchedulerInstanceStatuses.Deactivated, LocalDateTime.of(2020, 1, 1, 2, 29, 15))
    )

    val nr1 = NotificationRule(isActive = true, Some("project"), Some("ABC XYZ"), None, Seq(DagInstanceStatuses.Failed, DagInstanceStatuses.Succeeded),
      Seq("abc@xyz.com", "def@xyz.com"), created = LocalDateTime.now().plusDays(2), updated = None, id = 11L)
    val nr2 = NotificationRule(isActive = true, Some("project2"), Some("DEF_123"), None, Seq(DagInstanceStatuses.Failed, DagInstanceStatuses.Skipped),
      Seq("ghi.jkl@xyz.com"), created = LocalDateTime.now().plusDays(1), updated = None, id = 12L)
    val nr3 = NotificationRule(isActive = true, Some("project3"), Some("ABC ABC"), None, Seq(DagInstanceStatuses.Skipped),
      Seq("abc@xyz.com", "mno@xyz.com"), created = LocalDateTime.now(),updated = None, id = 13L)
    val notificationRules = Seq(nr1, nr2, nr3)
  }

  object TestSensors {
    val activeTimeW100: (Sensor, Workflow) = (Sensor(TestData.w1.id, TimeSensorProperties(cronExpression = ""), 100), TestData.w1)
    val activeAbsaKafka: (Sensor, Workflow) = (Sensor(TestData.w2.id, AbsaKafkaSensorProperties(topic = "", servers = List.empty[String], ingestionToken = ""), 101), TestData.w2)
    val activeKafka: (Sensor, Workflow) = (Sensor(TestData.w3.id, KafkaSensorProperties(topic = "", servers = List.empty[String], matchProperties = Map.empty[String, String]), 102), TestData.w3)
    val activeTimeW101: (Sensor, Workflow) = (Sensor(TestData.w4.id, TimeSensorProperties(cronExpression = ""), 103), TestData.w4)
    val inactiveTime: (Sensor, Workflow) = (Sensor(TestData.w5.id, TimeSensorProperties(cronExpression = ""), 104), TestData.w5)
    val inactiveAbsaKafka: (Sensor, Workflow) = (Sensor(TestData.w6.id, AbsaKafkaSensorProperties(topic = "", servers = List.empty[String], ingestionToken = ""), 105), TestData.w6)
    val inactiveKafka: (Sensor, Workflow) = (Sensor(TestData.w7.id, KafkaSensorProperties(topic = "", servers = List.empty[String], matchProperties = Map.empty[String, String]), 106), TestData.w7)

    val allSensors: Seq[(Sensor, Workflow)] = Seq(activeTimeW100, activeAbsaKafka, activeKafka, activeTimeW101, inactiveTime, inactiveAbsaKafka, inactiveKafka)
  }

  object TestDataJoined {
    val wj1 = createWorkflowJoined(TestData.w1, TestSensors.activeTimeW100._1, TestData.dd1, Seq(TestData.jd1dd1, TestData.jd2dd1))
    val wj2 = createWorkflowJoined(TestData.w2, TestSensors.activeAbsaKafka._1, TestData.dd2, Seq(TestData.jd1dd2))

    private def createWorkflowJoined(workflow: Workflow, sensor: Sensor, dagDefinition: DagDefinition, jobDefinitions: Seq[JobDefinition]) = {
      val dagDefinitionJoined = DagDefinitionJoined(dagDefinition, jobDefinitions)
      WorkflowJoined(
        workflow.name,
        workflow.isActive,
        workflow.project,
        workflow.created,
        workflow.updated,
        workflow.schedulerInstanceId,
        sensor,
        dagDefinitionJoined,
        workflow.id)
    }
  }
}
