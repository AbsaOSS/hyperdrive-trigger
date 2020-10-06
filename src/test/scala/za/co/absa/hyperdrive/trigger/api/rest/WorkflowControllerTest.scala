
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

package za.co.absa.hyperdrive.trigger.api.rest

import java.io.ByteArrayInputStream
import java.util.zip.ZipInputStream

import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.{reset, when}
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{AsyncFlatSpec, BeforeAndAfter, Matchers}
import za.co.absa.hyperdrive.trigger.ObjectMapperSingleton
import za.co.absa.hyperdrive.trigger.api.rest.controllers.WorkflowController
import za.co.absa.hyperdrive.trigger.api.rest.services.{JobTemplateFixture, WorkflowFixture, WorkflowService}
import za.co.absa.hyperdrive.trigger.models.WorkflowImportExportWrapper

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class WorkflowControllerTest extends AsyncFlatSpec with Matchers with MockitoSugar with BeforeAndAfter {
  private val workflowService = mock[WorkflowService]
  private val underTest = new WorkflowController(workflowService)

  before {
    reset(workflowService)
  }

  "exportWorkflows" should "export multiple workflows in a zip file" in {
    // given
    def readEntry(zis: ZipInputStream, size: Int) = {
      val byteArray = new Array[Byte](size)
      var i = 0
      val chunkSize = 10
      while(zis.read(byteArray, i, chunkSize) > 0) {
        i += chunkSize
      }
      byteArray
    }

    val workflowJoined1 = WorkflowFixture.createWorkflowJoined().copy()
    val workflowJoined2 = WorkflowFixture.createTimeBasedShellScriptWorkflow("project").copy()
    val jobTemplates1 = Seq(JobTemplateFixture.GenericSparkJobTemplate, JobTemplateFixture.GenericShellJobTemplate)
    val jobTemplates2 = Seq(JobTemplateFixture.GenericShellJobTemplate)
    val expectedWorkflowWrappers = Seq(
      WorkflowImportExportWrapper(workflowJoined1, jobTemplates1),
      WorkflowImportExportWrapper(workflowJoined2, jobTemplates2)
    )

    when(workflowService.exportWorkflows(any())(any())).thenReturn(Future {expectedWorkflowWrappers})

    // when
    val result = underTest.exportWorkflows(Array(21L, 22L)).get()

    // then
    val bais = new ByteArrayInputStream(result.getBody.getByteArray)
    val zis = new ZipInputStream(bais)
    val zipEntry1 = zis.getNextEntry
    zipEntry1.getName shouldBe "testWorkflow.json"
    val workflow1Bytes = readEntry(zis, 3000)
    val actualWorkflowWrapper1 = ObjectMapperSingleton.getObjectMapper.readValue(workflow1Bytes, classOf[WorkflowImportExportWrapper])
    actualWorkflowWrapper1 shouldBe expectedWorkflowWrappers.head

    val zipEntry2 = zis.getNextEntry
    zipEntry2.getName should startWith("Time")
    zipEntry2.getName should endWith(".json")
    val workflow2Bytes = readEntry(zis, 3000)
    val actualWorkflowWrapper2 = ObjectMapperSingleton.getObjectMapper.readValue(workflow2Bytes, classOf[WorkflowImportExportWrapper])
    actualWorkflowWrapper2 shouldBe expectedWorkflowWrappers(1)
  }

  it should "export a single workflow in a json file" in {
    // given
    val workflowJoined = WorkflowFixture.createWorkflowJoined().copy()
    val jobTemplates = Seq(JobTemplateFixture.GenericSparkJobTemplate, JobTemplateFixture.GenericShellJobTemplate)
    val expectedWorkflowWrapper = WorkflowImportExportWrapper(workflowJoined, jobTemplates)

    when(workflowService.exportWorkflows(any())(any())).thenReturn(Future {Seq(expectedWorkflowWrapper)})

    // when
    val result = underTest.exportWorkflows(Array(42L)).get()

    // then
    val actualWorkflowWrapper = ObjectMapperSingleton.getObjectMapper.readValue(result.getBody.getByteArray, classOf[WorkflowImportExportWrapper])
    actualWorkflowWrapper shouldBe expectedWorkflowWrapper
  }

  it should "throw an exception if the result set is empty" in {
    // TODO
  }
}