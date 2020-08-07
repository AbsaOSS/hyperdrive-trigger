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

package za.co.absa.hyperdrive.trigger.api.rest.utils

import org.scalatest.{FlatSpec, Matchers}
import za.co.absa.hyperdrive.trigger.models.enums.{DagInstanceStatuses, JobStatuses, JobTypes}
import za.co.absa.hyperdrive.trigger.models.{DagDefinitionJoined, JobDefinition, JobParameters}
import za.co.absa.hyperdrive.trigger.api.rest.services.JobTemplateFixture.{GenericShellJobTemplate, GenericSparkJobTemplate}

import scala.collection.immutable.SortedMap

class JobTemplateResolutionUtilTest extends FlatSpec with Matchers {

  "resolveDagDefinition" should "return a DagInstance with the same jobType as in the template" in {
    // given
    val jobDefinition = createJobDefinition()
    val dagDefinitionJoined = createDagDefinitionJoined(jobDefinition)
    val jobTemplate = GenericSparkJobTemplate

    // when
    val dagInstanceJoined = JobTemplateResolutionUtil.resolveDagDefinitionJoined(dagDefinitionJoined, Seq(jobTemplate))
    
    // then
    dagInstanceJoined.status shouldBe DagInstanceStatuses.InQueue
    val jobInstance = dagInstanceJoined.jobInstances.head
    jobInstance.dagInstanceId shouldBe 0
    jobInstance.jobStatus shouldBe JobStatuses.InQueue
    jobInstance.jobName shouldBe "JobDefinition0"
    jobInstance.jobType shouldBe JobTypes.Spark
    jobInstance.order shouldBe 2
    jobInstance.id shouldBe 0
  }

  it should "resolve templates for multiple JobDefinitions" in {
    // given
    val jobParameters1 = JobParameters(Map("key1" -> "value1"), Map(), Map())
    val jobTemplate1 = GenericSparkJobTemplate.copy(id = 1)
    val jobDefinition1 = createJobDefinition().copy(jobTemplateId = jobTemplate1.id, jobParameters = jobParameters1)

    val jobParameters2 = JobParameters(Map("key2" -> "value2"), Map(), Map())
    val jobTemplate2 = GenericShellJobTemplate.copy(id = 2)
    val jobDefinition2 = createJobDefinition().copy(jobTemplateId = jobTemplate2.id, jobParameters = jobParameters2)

    val dagDefinitionJoined = DagDefinitionJoined(jobDefinitions = Seq(jobDefinition1, jobDefinition2))

    // when
    val dagInstanceJoined = JobTemplateResolutionUtil.resolveDagDefinitionJoined(dagDefinitionJoined, Seq(jobTemplate1, jobTemplate2))

    // then
    val jobInstances = dagInstanceJoined.jobInstances
    jobInstances should have size 2
    jobInstances.head.jobType shouldBe JobTypes.Spark
    jobInstances.head.jobParameters.variables should contain theSameElementsAs Map("key1" -> "value1")
    jobInstances(1).jobType shouldBe JobTypes.Shell
    jobInstances(1).jobParameters.variables should contain theSameElementsAs Map("key2" -> "value2")
  }
  
  it should "merge variables, overwriting template-specified by user-specified in case of key-conflicts" in {
    // given
    val userParameters = JobParameters(Map(
      "userKey1" -> "userValue1",
      "userKey2" -> "userValue2",
      "sharedKey3" -> "userValueForSharedKey3",
      "sharedKey4" -> "userValueForSharedKey4"
    ), Map(), Map())
    val templateParameters = JobParameters(Map(
      "templateKey1" -> "templateValue1",
      "templateKey2" -> "templateValue2",
      "sharedKey3" -> "templateValueForSharedKey3",
      "sharedKey4" -> "templateValueForSharedKey4"
    ), Map(), Map())
    val jobDefinition = createJobDefinition().copy(jobParameters = userParameters)
    val dagDefinitionJoined = createDagDefinitionJoined(jobDefinition)
    val jobTemplate = GenericSparkJobTemplate.copy(jobParameters = templateParameters)

    // when
    val dagInstanceJoined = JobTemplateResolutionUtil.resolveDagDefinitionJoined(dagDefinitionJoined, Seq(jobTemplate))

    // then
    val jobInstance = dagInstanceJoined.jobInstances.head
    jobInstance.jobParameters.variables should contain theSameElementsAs Map(
      "userKey1" -> "userValue1",
      "userKey2" -> "userValue2",
      "templateKey1" -> "templateValue1",
      "templateKey2" -> "templateValue2",
      "sharedKey3" -> "userValueForSharedKey3",
      "sharedKey4" -> "userValueForSharedKey4"
    )
  }

  it should "merge maps, merging user-specified and template-specified lists in case of key-conflicts" in {
    // given
    val userParameters = JobParameters(Map(), Map(
      "userKey1" -> List("value1ForUserKey1", "value2ForUserKey1"),
      "userKey2" -> List("value1ForUserKey2", "value2ForUserKey2"),
      "sharedKey3" -> List("userValue1ForSharedKey3", "userValue2ForSharedKey3"),
      "sharedKey4" -> List("userValue1ForSharedKey4", "userValue2ForSharedKey4")
    ), Map())
    val templateParameters = JobParameters(Map(), Map(
      "templateKey1" -> List("value1ForTemplateKey1", "value2ForTemplateKey1"),
      "templateKey2" -> List("value1ForTemplateKey2", "value2ForTemplateKey2"),
      "sharedKey3" -> List("templateValue1ForSharedKey3", "templateValue2ForSharedKey3"),
      "sharedKey4" -> List("templateValue1ForSharedKey4", "templateValue2ForSharedKey4")
    ), Map())
    val jobDefinition = createJobDefinition().copy(jobParameters = userParameters)
    val dagDefinitionJoined = createDagDefinitionJoined(jobDefinition)
    val jobTemplate = GenericSparkJobTemplate.copy(jobParameters = templateParameters)

    // when
    val dagInstanceJoined = JobTemplateResolutionUtil.resolveDagDefinitionJoined(dagDefinitionJoined, Seq(jobTemplate))

    // then
    val jobInstance = dagInstanceJoined.jobInstances.head
    jobInstance.jobParameters.maps should contain theSameElementsAs Map(
      "userKey1" -> List("value1ForUserKey1", "value2ForUserKey1"),
      "userKey2" -> List("value1ForUserKey2", "value2ForUserKey2"),
      "templateKey1" -> List("value1ForTemplateKey1", "value2ForTemplateKey1"),
      "templateKey2" -> List("value1ForTemplateKey2", "value2ForTemplateKey2"),
      "sharedKey3" -> List("templateValue1ForSharedKey3", "templateValue2ForSharedKey3", "userValue1ForSharedKey3", "userValue2ForSharedKey3"),
      "sharedKey4" -> List("templateValue1ForSharedKey4", "templateValue2ForSharedKey4", "userValue1ForSharedKey4", "userValue2ForSharedKey4")
    )
  }

  it should "merge key-value-pairs, overwriting template-specified by user-specified maps in case of key-conflicts" in {
    // given
    val userParameters = JobParameters(Map(), Map(), Map(
      "userKey1" -> SortedMap("userKey11" -> "valueForUserKey11", "userKey12" -> "valueForUserKey12"),
      "userKey2" -> SortedMap("userKey21" -> "valueForUserKey21", "userKey22" -> "valueForUserKey22"),
      "sharedKey3" -> SortedMap("sharedKey31" -> "userValueForSharedKey31", "userKey32" -> "valueForUserKey32"),
      "sharedKey4" -> SortedMap("sharedKey41" -> "userValueForSharedKey41", "userKey42" -> "valueForUserKey42")
    ))
    val templateParameters = JobParameters(Map(), Map(), Map(
      "templateKey1" -> SortedMap("templateKey11" -> "valueForUserKey11", "userKey12" -> "valueForUserKey12"),
      "templateKey2" -> SortedMap("templateKey21" -> "valueForUserKey21", "userKey22" -> "valueForUserKey22"),
      "sharedKey3" -> SortedMap("sharedKey31" -> "templateValueForSharedKey31", "templateKey32" -> "valueForTemplateKey32"),
      "sharedKey4" -> SortedMap("sharedKey41" -> "templateValueForSharedKey41", "templateKey42" -> "valueForTemplateKey42")
    ))
    val jobDefinition = createJobDefinition().copy(jobParameters = userParameters)
    val dagDefinitionJoined = createDagDefinitionJoined(jobDefinition)
    val jobTemplate = GenericSparkJobTemplate.copy(jobParameters = templateParameters)

    // when
    val dagInstanceJoined = JobTemplateResolutionUtil.resolveDagDefinitionJoined(dagDefinitionJoined, Seq(jobTemplate))

    // then
    val jobInstance = dagInstanceJoined.jobInstances.head
    jobInstance.jobParameters.keyValuePairs should contain theSameElementsAs Map(
      "userKey1" -> SortedMap("userKey11" -> "valueForUserKey11", "userKey12" -> "valueForUserKey12"),
      "userKey2" -> SortedMap("userKey21" -> "valueForUserKey21", "userKey22" -> "valueForUserKey22"),
      "templateKey1" -> SortedMap("templateKey11" -> "valueForUserKey11", "userKey12" -> "valueForUserKey12"),
      "templateKey2" -> SortedMap("templateKey21" -> "valueForUserKey21", "userKey22" -> "valueForUserKey22"),
      "sharedKey3" -> Map(
        "sharedKey31" -> "userValueForSharedKey31",
        "userKey32" -> "valueForUserKey32",
        "templateKey32" -> "valueForTemplateKey32"
      ),
      "sharedKey4" -> Map(
        "sharedKey41" -> "userValueForSharedKey41",
        "userKey42" -> "valueForUserKey42",
        "templateKey42" -> "valueForTemplateKey42"
      )
    )
  }
  
  private def createDagDefinitionJoined(jobDefinition: JobDefinition) = {
    DagDefinitionJoined(jobDefinitions = Seq(jobDefinition))
  }
  
  private def createJobDefinition() = {
    JobDefinition(
      dagDefinitionId = 53,
      name = "JobDefinition0",
      jobType = JobTypes.Spark,
      jobParameters = JobParameters(Map(), Map(), Map()),
      order = 2,
      id = 42
    )
  }
}
