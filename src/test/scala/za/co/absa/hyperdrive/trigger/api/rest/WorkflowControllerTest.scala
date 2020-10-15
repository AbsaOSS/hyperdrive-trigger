
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

import java.io.{ByteArrayInputStream, ByteArrayOutputStream}
import java.util.zip.{ZipEntry, ZipInputStream, ZipOutputStream}

import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.{reset, verify, when}
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{AsyncFlatSpec, BeforeAndAfter, Matchers}
import org.springframework.mock.web.MockMultipartFile
import za.co.absa.hyperdrive.trigger.ObjectMapperSingleton
import za.co.absa.hyperdrive.trigger.api.rest.controllers.WorkflowController
import za.co.absa.hyperdrive.trigger.api.rest.services.JobTemplateFixture.{GenericShellJobTemplate, GenericSparkJobTemplate}
import za.co.absa.hyperdrive.trigger.api.rest.services.{WorkflowFixture, WorkflowService}
import za.co.absa.hyperdrive.trigger.models.errors.ApiException
import za.co.absa.hyperdrive.trigger.models.{Project, Workflow, WorkflowImportExportWrapper}

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
    val workflowJoined1 = WorkflowFixture.createWorkflowJoined().copy()
    val workflowJoined2 = WorkflowFixture.createTimeBasedShellScriptWorkflow("project").copy()
    val jobTemplates1 = Seq(GenericSparkJobTemplate, GenericShellJobTemplate)
    val jobTemplates2 = Seq(GenericShellJobTemplate)
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
    val workflow1Bytes = readEntry(zis)
    val actualWorkflowWrapper1 = ObjectMapperSingleton.getObjectMapper.readValue(workflow1Bytes, classOf[WorkflowImportExportWrapper])
    actualWorkflowWrapper1 shouldBe expectedWorkflowWrappers.head

    val zipEntry2 = zis.getNextEntry
    zipEntry2.getName should startWith("Time")
    zipEntry2.getName should endWith(".json")
    val workflow2Bytes = readEntry(zis)
    val actualWorkflowWrapper2 = ObjectMapperSingleton.getObjectMapper.readValue(workflow2Bytes, classOf[WorkflowImportExportWrapper])
    actualWorkflowWrapper2 shouldBe expectedWorkflowWrappers(1)
  }

  it should "export a single workflow in a json file" in {
    // given
    val workflowJoined = WorkflowFixture.createWorkflowJoined().copy()
    val jobTemplates = Seq(GenericSparkJobTemplate, GenericShellJobTemplate)
    val expectedWorkflowWrapper = WorkflowImportExportWrapper(workflowJoined, jobTemplates)

    when(workflowService.exportWorkflows(any())(any())).thenReturn(Future {Seq(expectedWorkflowWrapper)})

    // when
    val result = underTest.exportWorkflows(Array(42L)).get()

    // then
    val actualWorkflowWrapper = ObjectMapperSingleton.getObjectMapper.readValue(result.getBody.getByteArray, classOf[WorkflowImportExportWrapper])
    actualWorkflowWrapper shouldBe expectedWorkflowWrapper
  }

  it should "throw an exception if the result set is empty" in {
    // given
    when(workflowService.exportWorkflows(any())(any())).thenReturn(Future {Seq()})

    // when
    val exception = the [Exception] thrownBy underTest.exportWorkflows(Array(21L, 22L)).get()

    // then
    exception.getCause shouldBe a[ApiException]
    val apiException = exception.getCause.asInstanceOf[ApiException]
    apiException.apiErrors should have size 1
    apiException.apiErrors.head.message should include("21, 22")
  }

  "importWorkflows" should "unpack the workflows in the zip file" in {
    // given
    val w1 = WorkflowFixture.createTimeBasedShellScriptWorkflow("p")
    val w2 = WorkflowFixture.createWorkflowJoined()
    val jobTemplates1 = Seq(GenericSparkJobTemplate)
    val jobTemplates2 = Seq(GenericSparkJobTemplate, GenericShellJobTemplate)
    val workflowWrappers = Seq(
      WorkflowImportExportWrapper(w1, jobTemplates1),
      WorkflowImportExportWrapper(w2, jobTemplates2)
    )
    val zipEntries = Map("__MACOSX/abc" -> new Array[Byte](1)) ++
      workflowWrappers.map(w => w.workflowJoined.name ->
        ObjectMapperSingleton.getObjectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(w)).toMap
    val byteArray = createZip(zipEntries)
    val zip = new MockMultipartFile("the.zip", byteArray)

    val projects = Seq(
      Project(w1.project, Seq(w1.toWorkflow)),
      Project(w2.project, Seq(w2.toWorkflow))
    )
    when(workflowService.importWorkflows(any())(any())).thenReturn(Future { projects })

    // when
    val result = underTest.importWorkflows(zip).get()

    // then
    result shouldBe projects
    val workflowWrappersCaptor: ArgumentCaptor[Seq[WorkflowImportExportWrapper]] =
      ArgumentCaptor.forClass(classOf[Seq[WorkflowImportExportWrapper]])
    verify(workflowService).importWorkflows(workflowWrappersCaptor.capture())(any())
    workflowWrappersCaptor.getValue should contain theSameElementsAs workflowWrappers
  }

  it should "throw an exception if there's a parsing error" in {
    // given
    val w1 = Workflow("name1", isActive = true, project = "project1", updated = None)
    val w2 = Workflow("name2", isActive = true, project = "project2", updated = None)
    val zipEntries = Seq(w1, w2).map(w => w.name ->
      ObjectMapperSingleton.getObjectMapper.writeValueAsBytes(w)).toMap
    val byteArray = createZip(zipEntries)
    val zip = new MockMultipartFile("the.zip", byteArray)

    // when
    val result = the [ApiException] thrownBy underTest.importWorkflows(zip).get()

    // then
    result.apiErrors should have size 2
    result.apiErrors.head.message should include("name1")
    result.apiErrors(1).message should include("name2")
  }

  private def readEntry(zis: ZipInputStream) = {
    val byteArray = new Array[Byte](10)
    val baos = new ByteArrayOutputStream()
    while(zis.read(byteArray) > 0) {
      baos.write(byteArray)
    }
    baos.toByteArray
  }

  private def createZip(zipEntries: Map[String, Array[Byte]]) = {
    val baos = new ByteArrayOutputStream()
    val zos = new ZipOutputStream(baos)
    zipEntries.foreach(entry => {
      val zipEntry = new ZipEntry(s"${entry._1}")
      zos.putNextEntry(zipEntry)
      zos.write(entry._2, 0, entry._2.length)
      zos.closeEntry()
    })

    zos.close()
    baos.close()

    baos.toByteArray
  }
}