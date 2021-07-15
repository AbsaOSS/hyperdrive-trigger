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
import za.co.absa.hyperdrive.trigger.models.{AbsaKafkaSensorProperties, KafkaSensorProperties, SensorProperties, TimeSensorProperties}

import scala.concurrent.ExecutionContext.Implicits.global

class SensorRepositoryPostgresTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach with RepositoryPostgresTestBase {

  import TestSensors._
  val sensorRepository: SensorRepository = new SensorRepositoryImpl(dbProvider)

  override def beforeAll: Unit = {
    super.beforeAll()
    schemaSetup()
  }

  override def afterAll: Unit = {
    schemaDrop()
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

    val timeSensorPropertiesW100: TimeSensorProperties = activeTimeW100._1.properties.asInstanceOf[TimeSensorProperties]
    val changedActiveTimeW100 = activeTimeW100._1.copy(
      properties = timeSensorPropertiesW100.copy(cronExpression = "0 0 1 ? * * *")
    )
    val absaKafkaSensorProperties: AbsaKafkaSensorProperties = activeAbsaKafka._1.properties.asInstanceOf[AbsaKafkaSensorProperties]
    val changedActiveAbsaKafka = activeAbsaKafka._1.copy(
      properties = absaKafkaSensorProperties.copy(servers = List("abcd", "xyz"))
    )
    val kafkaSensorProperties: KafkaSensorProperties = activeKafka._1.properties.asInstanceOf[KafkaSensorProperties]
    val changedActiveKafka = activeKafka._1.copy(
      properties = kafkaSensorProperties.copy(matchProperties = Map("key" -> "value"))
    )
    val changedTimeSensorProperties = KafkaSensorProperties(
      topic = "",
      servers = List.empty[String],
      matchProperties = Map.empty[String, String]
    )
    val changedInactiveTime = inactiveTime._1.copy(
      properties = changedTimeSensorProperties
    )
    val changedSensors = Seq(
      (changedActiveTimeW100.id, changedActiveTimeW100.properties),
      (changedActiveAbsaKafka.id, changedActiveAbsaKafka.properties),
      (changedActiveKafka.id, changedActiveKafka.properties),
      (changedInactiveTime.id, changedInactiveTime.properties)
    )

    // execute
    val result = await(sensorRepository.getChangedSensors(changedSensors ++ Seq(
      (activeTimeW101._1.id, activeTimeW101._1.properties),
      (inactiveAbsaKafka._1.id, inactiveAbsaKafka._1.properties),
      (inactiveKafka._1.id, inactiveKafka._1.properties)
    )))

    // verify
    result.size shouldBe 4
    result should contain theSameElementsAs allSensors
      .filter { case (sensor, _) => changedSensors.map(_._1).contains(sensor.id) }
      .map { case (sensor, _) => sensor }
  }

  "sensorRepository.getChangedSensors" should "not fail on large number of sensors" in {
    // prepare
    insertSensors(allSensors)

    val timeSensorProperties: TimeSensorProperties = activeTimeW100._1.properties.asInstanceOf[TimeSensorProperties]
    val changedSensor = activeTimeW100._1.copy(
      properties = timeSensorProperties.copy(cronExpression = "0 0 1 ? * * *")
    )

    val numberOfChangedSensors = 10000
    val changedSensors: Seq[(Long, SensorProperties)] = Range(0, numberOfChangedSensors).map(_ => (changedSensor.id, changedSensor.properties))

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
