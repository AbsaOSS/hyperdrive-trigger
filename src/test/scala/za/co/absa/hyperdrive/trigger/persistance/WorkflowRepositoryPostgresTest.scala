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

import org.apache.commons.lang3.RandomStringUtils
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito._
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{FlatSpec, _}
import za.co.absa.hyperdrive.trigger.models.{Project, Workflow, WorkflowIdentity}
import za.co.absa.hyperdrive.trigger.models.enums.SchedulerInstanceStatuses
import za.co.absa.hyperdrive.trigger.models.errors.{ApiException, GenericDatabaseError}
import za.co.absa.hyperdrive.trigger.models.search.{BooleanFilterAttributes, BooleanValues, SortAttributes, TableSearchRequest, TableSearchResponse}

import scala.concurrent.ExecutionContext
import scala.concurrent.ExecutionContext.Implicits.global

class WorkflowRepositoryPostgresTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach
  with RepositoryPostgresTestBase with MockitoSugar {

  import api._

  val workflowHistoryRepositoryMock: WorkflowHistoryRepository = mock[WorkflowHistoryRepository]
  val workflowHistoryRepository: WorkflowHistoryRepository = new WorkflowHistoryRepositoryImpl(dbProvider)

  val workflowRepositoryMocked: WorkflowRepository = new WorkflowRepositoryImpl(dbProvider, workflowHistoryRepositoryMock)

  val workflowRepository: WorkflowRepository = new WorkflowRepositoryImpl(dbProvider, workflowHistoryRepository)


  override def beforeAll: Unit = {
    super.beforeAll()
    schemaSetup()
  }

  override def afterAll: Unit = {
    schemaDrop()
  }

  override def beforeEach: Unit = {
    reset(workflowHistoryRepositoryMock)
  }

  override def afterEach: Unit = {
    clearData()
  }

  "insertWorkflow" should "insert a workflow" in {
    // given
    insertJobTemplates()
    val workflowToInsert = TestDataJoined.wj1

    // when
    val workflowId = await(workflowRepository.insertWorkflow(workflowToInsert, "the-user"))

    // then
    val actualWorkflows = await(db.run(workflowTable.result))
    actualWorkflows should have size 1
    actualWorkflows.head.id shouldBe workflowId
    actualWorkflows.head.schedulerInstanceId shouldBe None
    actualWorkflows.head.name shouldBe workflowToInsert.name

    val actualSensors = await(db.run(sensorTable.result))
    actualSensors should have size 1
    actualSensors.head.id shouldBe workflowId
    actualSensors.head.properties.sensorType shouldBe workflowToInsert.sensor.properties.sensorType

    val actualDagDefinitions = await(db.run(dagDefinitionTable.result))
    actualDagDefinitions should have size 1
    actualDagDefinitions.head.workflowId shouldBe workflowId

    val actualJobDefinitions = await(db.run(jobDefinitionTable.result))
    actualJobDefinitions should have size 2
    actualJobDefinitions.map(_.name) should contain theSameElementsAs workflowToInsert.dagDefinitionJoined.jobDefinitions.map(_.name)

    val actualHistoryEntries = await(db.run(workflowHistoryTable.result))
    actualHistoryEntries should have size 1
    actualHistoryEntries.head.workflowId shouldBe workflowId
    actualHistoryEntries.head.history.changedBy shouldBe "the-user"
  }

  it should "throw an ApiException if the insert fails" in {
    // given
    insertJobTemplates()
    val tooLongWorkflowName = RandomStringUtils.randomAlphanumeric(100)
    val workflowToInsert = TestDataJoined.wj1.copy(name = tooLongWorkflowName)

    // when
    val result = the [ApiException] thrownBy await(workflowRepository.insertWorkflow(workflowToInsert, "the-user"))

    // then
    result.apiErrors should contain only GenericDatabaseError
    val actualWorkflows = await(db.run(workflowTable.result))
    actualWorkflows shouldBe empty
    val actualDagDefinitions = await(db.run(dagDefinitionTable.result))
    actualDagDefinitions shouldBe empty
    val actualJobDefinitions = await(db.run(jobDefinitionTable.result))
    actualJobDefinitions shouldBe empty
    val actualHistoryEntries = await(db.run(workflowHistoryTable.result))
    actualHistoryEntries shouldBe empty
  }

  "insertWorkflows" should "insert all workflows" in {
    // given
    insertJobTemplates()
    val workflowToInsert = Seq(TestDataJoined.wj1, TestDataJoined.wj2)

    // when
    val ids = await(workflowRepository.insertWorkflows(workflowToInsert, "the-user"))

    // then
    ids should have size 2

    val actualWorkflows = await(db.run(workflowTable.result))
    actualWorkflows should have size 2
    actualWorkflows.map(_.id) should contain theSameElementsAs ids
    actualWorkflows.map(_.name) shouldBe workflowToInsert.map(_.name)

    val actualDagDefinitions = await(db.run(dagDefinitionTable.result))
    actualDagDefinitions should have size 2
    actualDagDefinitions.map(_.workflowId) should contain theSameElementsAs ids

    val actualJobDefinitions = await(db.run(jobDefinitionTable.result))
    actualJobDefinitions should have size 3
    actualJobDefinitions.map(_.name) should contain theSameElementsAs workflowToInsert.flatMap(_.dagDefinitionJoined.jobDefinitions.map(_.name))

    val actualHistoryEntries = await(db.run(workflowHistoryTable.result))
    actualHistoryEntries should have size 2
    actualHistoryEntries.map(_.workflowId) should contain theSameElementsAs ids
    actualHistoryEntries.map(_.history.changedBy) should contain only "the-user"
  }

  it should "return an empty set if called with an empty set" in {
    // when
    val ids = await(workflowRepository.insertWorkflows(Seq(), "the-user"))

    // then
    ids shouldBe empty
    val actualWorkflows = await(db.run(workflowTable.result))
    actualWorkflows shouldBe empty
    val actualHistoryEntries = await(db.run(workflowHistoryTable.result))
    actualHistoryEntries shouldBe empty
  }

  it should "throw an ApiException if the insert fails and insert no workflow" in {
    // given
    insertJobTemplates()
    val tooLongWorkflowName = RandomStringUtils.randomAlphanumeric(100)
    val workflowsToInsert = Seq(TestDataJoined.wj1, TestDataJoined.wj2.copy(name = tooLongWorkflowName))

    // when
    val result = the [ApiException] thrownBy await(workflowRepository.insertWorkflows(workflowsToInsert, "the-user"))

    // then
    result.apiErrors should contain only GenericDatabaseError
    val actualWorkflows = await(db.run(workflowTable.result))
    actualWorkflows shouldBe empty
    val actualDagDefinitions = await(db.run(dagDefinitionTable.result))
    actualDagDefinitions shouldBe empty
    val actualJobDefinitions = await(db.run(jobDefinitionTable.result))
    actualJobDefinitions shouldBe empty
    val actualHistoryEntries = await(db.run(workflowHistoryTable.result))
    actualHistoryEntries shouldBe empty
  }

  "updateWorkflow" should "update a workflow" in {
    // given
    insertJobTemplates()
    val workflowV1 = TestDataJoined.wj1
    val workflowId = await(workflowRepository.insertWorkflow(workflowV1, "the-user"))
    val sensorId = await(db.run(sensorTable.result)).head.id
    val dagDefinitionId = await(db.run(dagDefinitionTable.result)).head.id
    val workflowV2 = TestDataJoined.wj2.copy(
      id = workflowId,
      sensor = TestDataJoined.wj2.sensor.copy(id = sensorId, workflowId = workflowId),
      dagDefinitionJoined = TestDataJoined.wj2.dagDefinitionJoined.copy(
        id = dagDefinitionId,
        workflowId = workflowId)
    )

    // when
    await(workflowRepository.updateWorkflow(workflowV2, "the-user"))

    // then
    val allWorkflows = await(db.run(workflowTable.result))
    allWorkflows should have size 1
    val actualWorkflow = allWorkflows.head
    actualWorkflow.name shouldBe workflowV2.name
    actualWorkflow.isActive shouldBe workflowV2.isActive
    actualWorkflow.project shouldBe workflowV2.project
    actualWorkflow.created shouldBe workflowV2.created

    val actualSensors = await(db.run(sensorTable.result))
    actualSensors should have size 1
    actualSensors.head.id shouldBe workflowId
    actualSensors.head.properties.sensorType shouldBe workflowV2.sensor.properties.sensorType

    val actualJobDefinitions = await(db.run(jobDefinitionTable.result))
    actualJobDefinitions should have size workflowV2.dagDefinitionJoined.jobDefinitions.size
    actualJobDefinitions.map(_.name) should contain theSameElementsAs workflowV2.dagDefinitionJoined.jobDefinitions.map(_.name)

    val actualHistoryEntries = await(db.run(workflowHistoryTable.result))
    actualHistoryEntries should have size 2
    actualHistoryEntries.head.workflowId shouldBe workflowId
    actualHistoryEntries.head.history.changedBy shouldBe "the-user"
  }

  it should "throw an ApiException if the update fails" in {
    // given
    insertJobTemplates()
    val workflowV1 = TestDataJoined.wj1
    val workflowId = await(workflowRepository.insertWorkflow(workflowV1, "the-user"))

    val tooLongWorkflowName = RandomStringUtils.randomAlphanumeric(100)
    val workflowV2 = TestDataJoined.wj2.copy(name = tooLongWorkflowName, id = workflowId)

    // when
    val result = the [ApiException] thrownBy await(workflowRepository.updateWorkflow(workflowV2, "the-user"))

    // then
    result.apiErrors should contain only GenericDatabaseError
  }

  "existsOtherWorkflow" should "return the already existing workflow names" in {
    createTestData()
    val names = Seq(TestData.w1.name, TestData.w2.name, "non-existing-workflow")
    val existingWorkflowNames = await(workflowRepository.existsWorkflows(names))

    existingWorkflowNames should contain theSameElementsAs Seq(TestData.w1.name, TestData.w2.name)
  }

  it should "return an empty set if all given workflow names don't exist" in {
    createTestData()
    val names = Seq("non-existing-workflow-1", "non-existing-workflow-2", "non-existing-workflow-3")
    val existingWorkflowNames = await(workflowRepository.existsWorkflows(names))

    existingWorkflowNames shouldBe empty
  }


  it should "return an empty set given an empty set" in {
    createTestData()
    val existingWorkflowNames = await(workflowRepository.existsWorkflows(Seq()))

    existingWorkflowNames shouldBe empty
  }

  "existsWorkflowWithPrefix" should "return true if workflow with prefix exists (case-insensitive)" in {
    createTestData()
    val result1 = await(workflowRepository.existsWorkflowWithPrefix("work"))
    val result2 = await(workflowRepository.existsWorkflowWithPrefix("WORK"))
    result1 shouldBe true
    result2 shouldBe true
  }

  it should "return false if no workflow with prefix exists" in {
    createTestData()
    val result = await(workflowRepository.existsWorkflowWithPrefix("flow"))
    result shouldBe false
  }

  "getWorkflow" should "return the workflow" in {
    createTestData()
    val expectedWorkflow = TestDataJoined.wj1

    val actualWorkflow = await(workflowRepository.getWorkflow(expectedWorkflow.id))

    actualWorkflow shouldBe expectedWorkflow
  }

  it should "throw an exception if the workflow doesn't exist" in {
    val exception = the [Exception] thrownBy await(workflowRepository.getWorkflow(42))
    exception.getMessage should include("42")
  }

  "getWorkflows" should "return the workflows" in {
    createTestData()
    val expectedWorkflows = Seq(TestDataJoined.wj1, TestDataJoined.wj2)
    val ids = expectedWorkflows.map(_.id)
    val actualWorkflows = await(workflowRepository.getWorkflows(ids))

    actualWorkflows.map(_.toWorkflow) should contain theSameElementsAs expectedWorkflows.map(_.toWorkflow)
    actualWorkflows.map(_.sensor) should contain theSameElementsAs expectedWorkflows.map(_.sensor)
    actualWorkflows.map(_.dagDefinitionJoined.toDag()) should contain theSameElementsAs expectedWorkflows.map(_.dagDefinitionJoined.toDag())
    actualWorkflows.flatMap(_.dagDefinitionJoined.jobDefinitions) should contain theSameElementsAs expectedWorkflows.flatMap(_.dagDefinitionJoined.jobDefinitions)
  }

  it should "return an empty seq if no workflows are found" in {
    val actualWorkflows = await(workflowRepository.getWorkflows(Seq(42)))
    actualWorkflows shouldBe empty
  }


  "switchWorkflowActiveState" should "switch the active state and create a history entry" in {
    createTestData()
    val workflowId = TestData.w1.id
    val isActiveBefore = TestData.w1.isActive

    await(workflowRepository.switchWorkflowActiveState(workflowId, "testUser"))

    val actualWorkflow = await(workflowRepository.getWorkflow(workflowId))
    actualWorkflow.isActive shouldBe !isActiveBefore
    val actualHistoryEntries = await(db.run(workflowHistoryTable.result))
    actualHistoryEntries should have size 1
    actualHistoryEntries.head.workflow.id shouldBe workflowId
    actualHistoryEntries.head.workflow.isActive shouldBe !isActiveBefore
  }

  it should "fail if the workflow doesn't exist" in {
    val exception = the [Exception] thrownBy await(workflowRepositoryMocked.switchWorkflowActiveState(42L, "testUser"))

    exception.getMessage should include("42")
  }

  it should "fail if inserting the history entry fails" in {
    createTestData()
    val workflowId = TestData.w1.id
    when(workflowHistoryRepositoryMock.update(any(), any())(any[ExecutionContext])).thenReturn(DBIO.failed(new Exception("Could not insert history entry")))

    val exception = the [Exception] thrownBy await(workflowRepositoryMocked.switchWorkflowActiveState(workflowId, "testUser"))

    exception.getMessage shouldBe "Could not insert history entry"
  }

  "updateWorkflowsIsActive" should "activate the workflows" in {
    createTestData()
    val workflowIds = TestData.workflows.map(_.id)

    await(workflowRepository.updateWorkflowsIsActive(workflowIds, isActiveNewValue = true, "testUser"))

    val actualWorkflows = await(workflowRepository.getWorkflows())
    actualWorkflows.map(_.isActive) should contain only true
    val actualHistoryEntries = await(db.run(workflowHistoryTable.result))
    actualHistoryEntries should have size TestData.workflows.size
    actualHistoryEntries.map(_.workflowId) should contain theSameElementsAs workflowIds
  }

  it should "deactivate the workflows" in {
    createTestData()
    val workflowIds = TestData.workflows.map(_.id)

    await(workflowRepository.updateWorkflowsIsActive(workflowIds, isActiveNewValue = false, "testUser"))

    val actualWorkflows = await(workflowRepository.getWorkflows())
    actualWorkflows.map(_.isActive) should contain only false
    val actualHistoryEntries = await(db.run(workflowHistoryTable.result))
    actualHistoryEntries should have size TestData.workflows.size
    actualHistoryEntries.map(_.workflowId) should contain theSameElementsAs workflowIds
  }

  it should "do nothing when called with an empty seq" in {
    createTestData()

    await(workflowRepository.updateWorkflowsIsActive(Seq(), isActiveNewValue = true,"testUser"))

    val actualWorkflows = await(workflowRepository.getWorkflows())
    actualWorkflows.map(_.updated) should contain only None
    val actualHistoryEntries = await(db.run(workflowHistoryTable.result))
    actualHistoryEntries shouldBe empty
  }

  it should "not change the active state of any workflow if inserting the history entry fails" in {
    createTestData()
    val workflowIds = TestData.workflows.map(_.id)
    when(workflowHistoryRepositoryMock.update(any(), any())(any[ExecutionContext])).thenReturn(DBIO.failed(new Exception("Could not insert history entry")))

    val exception = the [Exception] thrownBy await(workflowRepositoryMocked.updateWorkflowsIsActive(workflowIds, isActiveNewValue = true, "testUser"))

    exception.getMessage shouldBe "Could not insert history entry"
    val actualWorkflows = await(workflowRepositoryMocked.getWorkflows())
    actualWorkflows.map(_.updated) should contain only None
    val actualHistoryEntries = await(db.run(workflowHistoryTable.result))
    actualHistoryEntries shouldBe empty
  }

  it should "not change the active state of any workflow and not create history entries if an exception is thrown" in {
    // given
    createTestData()
    val activeStateW1 = TestData.w1.isActive
    val activeStateW2 = TestData.w2.isActive
    val activeStateW3 = TestData.w3.isActive

    val nonExistentWorkflowId = 9999L
    val workflowIds = TestData.workflows.map(_.id) :+ nonExistentWorkflowId

    // when
    val exception = the [Exception] thrownBy await(workflowRepository.updateWorkflowsIsActive(workflowIds, isActiveNewValue = true, "testUser"))

    // then
    exception.getMessage should include("9999")
    val workflow1 = await(workflowRepository.getWorkflow(TestData.w1.id))
    val workflow2 = await(workflowRepository.getWorkflow(TestData.w2.id))
    val workflow3 = await(workflowRepository.getWorkflow(TestData.w3.id))

    workflow1.isActive shouldBe activeStateW1
    workflow2.isActive shouldBe activeStateW2
    workflow3.isActive shouldBe activeStateW3

    workflow1.updated shouldBe None
    workflow2.updated shouldBe None
    workflow3.updated shouldBe None

    val historyEntries = await(db.run(workflowHistoryTable.result))
    historyEntries shouldBe empty
  }

  "existsProject" should "return true if a workflow with the project name exists (case-insensitive)" in {
    createTestData()
    val result1 = await(workflowRepository.existsProject("project1"))
    val result2 = await(workflowRepository.existsProject("PROJect1"))
    result1 shouldBe true
    result2 shouldBe true
  }

  it should "return false if no workflow with the project name exists" in {
    createTestData()
    val result = await(workflowRepository.existsProject("proj"))
    result shouldBe false
  }

  "releaseWorkflowAssignmentsOfDeactivatedInstances" should "remove the instanceId for deactivated instances" in {
    // given
    val instance0 = TestData.schedulerInstances.head.copy(status = SchedulerInstanceStatuses.Active)
    val instance1 = TestData.schedulerInstances(1).copy(status = SchedulerInstanceStatuses.Deactivated)
    val instance2 = TestData.schedulerInstances(2).copy(status = SchedulerInstanceStatuses.Deactivated)
    val workflows = TestData.workflows.filter(_.id % 3 == 0).map(_.copy(schedulerInstanceId = Some(instance0.id))) ++
      TestData.workflows.filter(_.id % 3 == 1).map(_.copy(schedulerInstanceId = Some(instance1.id))) ++
      TestData.workflows.filter(_.id % 3 == 2).map(_.copy(schedulerInstanceId = Some(instance2.id)))

    run(schedulerInstanceTable.forceInsertAll(Seq(instance0, instance1, instance2)))
    run(workflowTable.forceInsertAll(workflows))

    // when
    await(workflowRepository.releaseWorkflowAssignmentsOfDeactivatedInstances())

    // then
    val updatedWorkflows = await(db.run(workflowTable.result))
    updatedWorkflows.filter(_.id % 3 == 0).map(_.schedulerInstanceId) should contain only Some(instance0.id)
    updatedWorkflows.filter(_.id % 3 != 0).map(_.schedulerInstanceId) should contain only None

    val instances = await(db.run(schedulerInstanceTable.result))
    instances.map(_.status) should contain only SchedulerInstanceStatuses.Active
  }

  it should "delete deactivated instances" in {
    // given
    val instance0 = TestData.schedulerInstances.head.copy(status = SchedulerInstanceStatuses.Active)
    val instance1 = TestData.schedulerInstances(1).copy(status = SchedulerInstanceStatuses.Deactivated)
    val instance2 = TestData.schedulerInstances(2).copy(status = SchedulerInstanceStatuses.Deactivated)

    run(schedulerInstanceTable.forceInsertAll(Seq(instance0, instance1, instance2)))

    // when
    await(workflowRepository.releaseWorkflowAssignmentsOfDeactivatedInstances())

    // then
    val instances = await(db.run(schedulerInstanceTable.result))
    instances.map(_.status) should contain only SchedulerInstanceStatuses.Active
  }

  "getProjects()" should "return workflow identities grouped by project name" in {
    // given
    createTestData()
    val expected = TestData.workflows.groupBy(_.project).map{ case (project, workflows) =>
      Project(project, workflows.map(workflow => WorkflowIdentity(workflow.id, workflow.name)))
    }

    // when
    val result = await(workflowRepository.getProjects())

    // then
    result shouldBe expected
  }

  "releaseWorkflowAssignments" should "remove the instanceId if the workflow is owned by the instanceId" in {
    // given
    val instance0 = TestData.schedulerInstances.head.copy(status = SchedulerInstanceStatuses.Active)
    val instance1 = TestData.schedulerInstances(1).copy(status = SchedulerInstanceStatuses.Active)
    val instance2 = TestData.schedulerInstances(2).copy(status = SchedulerInstanceStatuses.Deactivated)
    val workflows = TestData.workflows.filter(_.id % 3 == 0).map(_.copy(schedulerInstanceId = Some(instance0.id))) ++
      TestData.workflows.filter(_.id % 3 == 1).map(_.copy(schedulerInstanceId = Some(instance1.id))) ++
      TestData.workflows.filter(_.id % 3 == 2).map(_.copy(schedulerInstanceId = Some(instance2.id)))

    run(schedulerInstanceTable.forceInsertAll(Seq(instance0, instance1, instance2)))
    run(workflowTable.forceInsertAll(workflows))

    // when
    await(workflowRepository.releaseWorkflowAssignments(workflows.map(_.id), instance0.id))

    // then
    val updatedWorkflows = await(db.run(workflowTable.result))
    updatedWorkflows.filter(_.id % 3 == 0).map(_.schedulerInstanceId) should contain only None
    updatedWorkflows.filter(_.id % 3 == 1).map(_.schedulerInstanceId) should contain only Some(instance1.id)
    updatedWorkflows.filter(_.id % 3 == 2).map(_.schedulerInstanceId) should contain only Some(instance2.id)
  }

  "acquireWorkflowAssignments" should "set the instanceId if the workflow is owned by no instance" in {
    // given
    val instance0 = TestData.schedulerInstances.head.copy(status = SchedulerInstanceStatuses.Active)
    val instance1 = TestData.schedulerInstances(1).copy(status = SchedulerInstanceStatuses.Active)
    val instance2 = TestData.schedulerInstances(2).copy(status = SchedulerInstanceStatuses.Deactivated)
    val workflows = TestData.workflows.filter(_.id % 3 == 0).map(_.copy(schedulerInstanceId = Some(instance0.id))) ++
      TestData.workflows.filter(_.id % 3 == 1).map(_.copy(schedulerInstanceId = None)) ++
      TestData.workflows.filter(_.id % 3 == 2).map(_.copy(schedulerInstanceId = Some(instance2.id)))

    run(schedulerInstanceTable.forceInsertAll(Seq(instance0, instance1, instance2)))
    run(workflowTable.forceInsertAll(workflows))

    // when
    await(workflowRepository.acquireWorkflowAssignments(workflows.map(_.id), instance0.id))

    // then
    val updatedWorkflows = await(db.run(workflowTable.result))
    updatedWorkflows.filter(_.id % 3 != 2).map(_.schedulerInstanceId) should contain only Some(instance0.id)
    updatedWorkflows.filter(_.id % 3 == 2).map(_.schedulerInstanceId) should contain only Some(instance2.id)
  }

  it should "never double assign a workflow in interleaved executions" in {
    val instances = TestData.schedulerInstances.filter(_.status == SchedulerInstanceStatuses.Active)
    val baseWorkflow = TestData.workflows.head
    val workflows = (1 to 50).map(i => baseWorkflow.copy(name = s"workflow$i", id = i))
    run(workflowTable.forceInsertAll(workflows))
    run(schedulerInstanceTable.forceInsertAll(instances))

    val targetWorkflows1 = Seq(1L, 2, 3, 11, 12, 13)
    val targetWorkflows2 = Seq(1L, 2, 3, 21, 22, 23)
    val targetWorkflows3 = Seq(1L, 2, 3, 31, 32, 33)
    val acquire1Count = await(workflowRepository.acquireWorkflowAssignments(targetWorkflows1, instances(1).id))
    val release1Count = await(workflowRepository.releaseWorkflowAssignments(targetWorkflows1, instances(2).id))
    val release2Count = await(workflowRepository.releaseWorkflowAssignments(targetWorkflows1, instances(3).id))
    val result1 = await(workflowRepository.getWorkflowsBySchedulerInstance(instances(1).id))
    val acquire2Count = await(workflowRepository.acquireWorkflowAssignments(targetWorkflows2, instances(2).id))
    val result2 = await(workflowRepository.getWorkflowsBySchedulerInstance(instances(2).id))
    val acquire3Count = await(workflowRepository.acquireWorkflowAssignments(targetWorkflows3, instances(3).id))
    val result3 = await(workflowRepository.getWorkflowsBySchedulerInstance(instances(3).id))

    acquire1Count shouldBe 6
    acquire2Count shouldBe 3
    acquire3Count shouldBe 3
    release1Count shouldBe 0
    release2Count shouldBe 0
    assertNoWorkflowIsDoubleAssigned(result1, result2, result3)
  }

  "getWorkflowsBySchedulerInstance" should "return workflows by scheduler instance" in {
    // given
    val instance0 = TestData.schedulerInstances.head.copy(status = SchedulerInstanceStatuses.Active)
    val instance1 = TestData.schedulerInstances(1).copy(status = SchedulerInstanceStatuses.Active)
    val workflows = TestData.workflows.filter(_.id % 2 == 0).map(_.copy(schedulerInstanceId = Some(instance0.id))) ++
      TestData.workflows.filter(_.id % 2 == 1).map(_.copy(schedulerInstanceId = Some(instance1.id)))
    run(schedulerInstanceTable.forceInsertAll(Seq(instance0, instance1)))
    run(workflowTable.forceInsertAll(workflows))

    // when
    val result = await(workflowRepository.getWorkflowsBySchedulerInstance(instance0.id))

    // then
    result should contain theSameElementsAs workflows.filter(_.id % 2 == 0)
  }

  "getMaxWorkflowId" should "return the highest workflow id" in {
    run(workflowTable.forceInsertAll(TestData.workflows))

    val result = await(workflowRepository.getMaxWorkflowId)

    result shouldBe Some(TestData.workflows.map(_.id).max)
  }

  it should "return None if there are no workflows" in {
    await(workflowRepository.getMaxWorkflowId) shouldBe None
  }

  "searchWorkflows" should "return zero workflows when db is empty" in {
    val searchRequest: TableSearchRequest = TableSearchRequest(
      sort = None,
      from = 0,
      size = Integer.MAX_VALUE
    )

    val result: TableSearchResponse[Workflow] = await(workflowRepository.searchWorkflows(searchRequest))
    result.total shouldBe 0
    result.items shouldBe Seq.empty[Workflow]
  }

  it should "return all workflows with no search query" in {
    createTestData()
    val searchRequest: TableSearchRequest = TableSearchRequest(
      sort = None,
      from = 0,
      size = Integer.MAX_VALUE
    )

    val result: TableSearchResponse[Workflow] = await(workflowRepository.searchWorkflows(searchRequest))
    result.total shouldBe TestData.workflows.size
    result.items shouldBe TestData.workflows
  }

  it should "using from and size should return paginated workflows" in {
    createTestData()
    val searchRequest: TableSearchRequest = TableSearchRequest(
      sort = None,
      from = 2,
      size = 2
    )

    val result: TableSearchResponse[Workflow] = await(workflowRepository.searchWorkflows(searchRequest))
    result.total shouldBe TestData.workflows.size
    result.items.size shouldBe searchRequest.size
  }

  it should "using sort by workflow name (asc order) should return sorted workflows" in {
    createTestData()
    val searchRequest: TableSearchRequest = TableSearchRequest(
      sort = Option(SortAttributes(by = "name", order = 1)),
      from = 0,
      size = Integer.MAX_VALUE
    )

    val result: TableSearchResponse[Workflow] = await(workflowRepository.searchWorkflows(searchRequest))
    result.total shouldBe TestData.workflows.size
    result.items.size shouldBe TestData.workflows.size
    result.items shouldBe TestData.workflows.sortBy(_.name)
  }

  it should "using sort by id (desc order) should return sorted workflows" in {
    createTestData()
    val searchRequest: TableSearchRequest = TableSearchRequest(
      sort = Option(SortAttributes(by = "id", order = -1)),
      from = 0,
      size = Integer.MAX_VALUE
    )

    val result: TableSearchResponse[Workflow] = await(workflowRepository.searchWorkflows(searchRequest))
    result.total shouldBe TestData.workflows.size
    result.items.size shouldBe TestData.workflows.size
    result.items shouldBe TestData.workflows.sortWith(_.id > _.id)
  }

  it should "apply filters" in {
    createTestData()

    val booleanFilterAttributes = Option(Seq(
      BooleanFilterAttributes(field = "isActive", BooleanValues(isTrue = false, isFalse = true))
    ))
    val searchRequest: TableSearchRequest = TableSearchRequest(
      booleanFilterAttributes = booleanFilterAttributes,
      sort = None,
      from = 0,
      size = Integer.MAX_VALUE
    )

    val result = await(workflowRepository.searchWorkflows(searchRequest))

    val expected = TestData.workflows.filter(workflow => !workflow.isActive)
    result.total should be > 0
    result.total shouldBe expected.size
    result.items should contain theSameElementsAs expected
  }

  private def assertNoWorkflowIsDoubleAssigned(workflows: Seq[Workflow]*) = {
    val flatWorkflows = workflows.flatten
    flatWorkflows.size shouldBe flatWorkflows.distinct.size
  }
}
