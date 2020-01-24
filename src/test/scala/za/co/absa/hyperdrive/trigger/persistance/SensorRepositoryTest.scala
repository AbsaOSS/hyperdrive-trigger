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

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.Duration

class SensorRepositoryTest extends FlatSpec with Matchers with BeforeAndAfterAll with BeforeAndAfterEach with RepositoryTestBase {

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

  "sensorRepository.getNewActiveSensors" should "return sensors with active workflows, expect sensors excluded by id" in {
    // prepare
    val idsToExclude = Seq(activeTimeW100, activeAbsaKafka).map{case (sensor, _) => sensor.id}
    insertSensors(allSensors)

    // execute
    val result = Await.result(sensorRepository.getNewActiveSensors(idsToExclude), Duration.Inf)

    // verify
    result.size shouldBe 2
    result should contain theSameElementsAs Seq(activeKafka._1, activeTimeW101._1)
  }

  "sensorRepository.getInactiveSensors" should "given a set of sensor ids, return the ids of the inactive ones" in {
    // prepare
    val ids = Seq(activeTimeW100, activeAbsaKafka, inactiveTime, inactiveKafka).map{case (sensor, _) => sensor.id}
    insertSensors(allSensors)

    // execute
    val result = Await.result(sensorRepository.getInactiveSensors(ids), Duration.Inf)

    // verify
    result.size shouldBe 2
    result should contain theSameElementsAs Seq(inactiveTime._1.id, inactiveKafka._1.id)
  }
}
