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

import org.scalatest.{FlatSpec, _}
import za.co.absa.hyperdrive.trigger.models.Sensor
import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes

import scala.concurrent.ExecutionContext.Implicits.global

class SensorRepositoryTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach with RepositoryH2TestBase {

  import TestSensors._
  val sensorRepository: SensorRepository = new SensorRepositoryImpl { override val profile = h2Profile }

  override def beforeAll: Unit = {
    h2SchemaSetup()
  }

  override def afterAll: Unit = {
    h2SchemaDrop()
  }

  override def afterEach: Unit = {
    clearData()
  }

  "sensorRepository.getNewActiveAssignedSensors" should "return sensors with active workflows, except sensors excluded by id" in {
    // prepare
    val idsToExclude = Seq(activeTimeW100, activeAbsaKafka).map{case (sensor, _) => sensor.id}
    insertSensors(allSensors)

    // execute
    val result = await(sensorRepository.getNewActiveAssignedSensors(idsToExclude, TestData.workflows.map(_.id)))

    // verify
    result.size shouldBe 2
    result should contain theSameElementsAs Seq(activeKafka._1, activeTimeW101._1)
  }

  it should "given an empty seq, return all active sensors" in {
    insertSensors(allSensors)

    val result = await(sensorRepository.getNewActiveAssignedSensors(Seq.empty, TestData.workflows.map(_.id)))

    result should contain theSameElementsAs allSensors
      .filter{ case (_, workflow) => workflow.isActive }
      .map{ case (sensor, _) => sensor }
  }

  it should "only return sensors of assigned workflows" in {
    insertSensors(allSensors)

    val assignedWorkflowId = TestData.workflows.head.id
    val result = await(sensorRepository.getNewActiveAssignedSensors(Seq.empty, Seq(assignedWorkflowId)))

    result should not be empty
    result should contain theSameElementsAs allSensors
      .filter{ case (_, workflow) => workflow.isActive && workflow.id == assignedWorkflowId }
      .map{ case (sensor, _) => sensor }
  }

  "sensorRepository.getInactiveSensors" should "given a set of sensor ids, return the ids of the inactive ones" in {
    // prepare
    val ids = Seq(activeTimeW100, activeAbsaKafka, inactiveTime, inactiveKafka).map{case (sensor, _) => sensor.id}
    insertSensors(allSensors)

    // execute
    val result = await(sensorRepository.getInactiveSensors(ids))

    // verify
    result.size shouldBe 2
    result should contain theSameElementsAs Seq(inactiveTime._1.id, inactiveKafka._1.id)
  }

  it should "given an empty seq, return en empty seq" in {
    insertSensors(allSensors)

    val result = await(sensorRepository.getInactiveSensors(Seq.empty))

    result shouldBe empty
  }

  "sensorRepository.getChangedSensors" should "given a set of sensors, return the sensors with changed type or properties" in {
    // prepare
    insertSensors(allSensors)

    val changedActiveTimeW100 = activeTimeW100._1.copy(
      properties = activeTimeW100._1.properties.copy(
        settings = activeTimeW100._1.properties.settings.copy(variables = Map("cronExpression" -> "0 0 1 ? * * *"))
      ))
    val changedActiveAbsaKafka = activeAbsaKafka._1.copy(
      properties = activeAbsaKafka._1.properties.copy(
        settings = activeAbsaKafka._1.properties.settings.copy(maps = Map("servers" -> List("abcd", "xyz")))
      ))
    val changedActiveKafka = activeKafka._1.copy(
      properties = activeKafka._1.properties.copy(
        matchProperties = Map("key" -> "value")
      ))
    val changedInactiveTime = inactiveTime._1.copy(sensorType = SensorTypes.Kafka)
    val changedSensors = Seq(changedActiveTimeW100, changedActiveAbsaKafka, changedActiveKafka, changedInactiveTime)

    // execute
    val result = await(sensorRepository.getChangedSensors(changedSensors ++ Seq(activeTimeW101._1, inactiveAbsaKafka._1, inactiveKafka._1)))

    // verify
    result.size shouldBe 4
    result should contain theSameElementsAs allSensors
      .filter { case (sensor, _) => changedSensors.map(_.id).contains(sensor.id) }
      .map { case (sensor, _) => sensor }
  }

  "sensorRepository.getChangedSensors" should "not fail on large number of sensors" in {
    // prepare
    insertSensors(allSensors)

    val changedSensor = activeTimeW100._1.copy(
      properties = activeTimeW100._1.properties.copy(
        settings = activeTimeW100._1.properties.settings.copy(variables = Map("cronExpression" -> "0 0 1 ? * * *"))
      ))

    val numberOfChangedSensors = 10000
    val changedSensors: Seq[Sensor] = Range(0, numberOfChangedSensors).map(_ => changedSensor)

    // execute
    val result = await(sensorRepository.getChangedSensors(changedSensors))

    // verify
    result.distinct.size shouldBe 1
  }

  it should "given an empty seq, return an empty seq" in {
    val result = await(sensorRepository.getChangedSensors(Seq.empty))

    result shouldBe empty
  }
}
