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

package za.co.absa.hyperdrive.trigger.scheduler.notifications

import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.{any, eq => eqTo}
import org.mockito.Mockito.{reset, times, verify, when}
import org.mockito.invocation.InvocationOnMock
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{BeforeAndAfter, FlatSpec, Matchers}
import org.springframework.mail.{MailException, MailSendException}
import za.co.absa.hyperdrive.trigger.TestUtils.await
import za.co.absa.hyperdrive.trigger.api.rest.services.NotificationRuleService
import za.co.absa.hyperdrive.trigger.configuration.application.{
  DefaultTestSparkConfig,
  TestGeneralConfig,
  TestNotificationConfig
}
import za.co.absa.hyperdrive.trigger.models._
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.InQueue
import za.co.absa.hyperdrive.trigger.models.enums.{DagInstanceStatuses, JobStatuses}
import za.co.absa.hyperdrive.trigger.scheduler.utilities.email.EmailService

import java.time.{LocalDate, LocalDateTime, LocalTime}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class NotificationSenderTest extends FlatSpec with MockitoSugar with Matchers with BeforeAndAfter {
  private val notificationRuleService = mock[NotificationRuleService]
  private val emailService = mock[EmailService]
  private val clusterBaseUrl = "http://localhost:8088"
  private val senderAddress = "sender <sender@abc.com>"
  private val environment = "TEST"

  private val underTest = createNotificationRuleService()

  before {
    reset(notificationRuleService)
    reset(emailService)
  }

  "sendNotifications" should "send notifications" in {
    // given
    val di = createDagInstance().copy(
      status = DagInstanceStatuses.Succeeded,
      started = LocalDateTime.of(LocalDate.of(2020, 3, 2), LocalTime.of(12, 30)),
      finished = Some(LocalDateTime.of(LocalDate.of(2020, 3, 2), LocalTime.of(14, 30)))
    )
    val ji = createJobInstance().copy(jobStatus = JobStatuses.Succeeded)
    val nr1 = createNotificationRule().copy(id = 1, recipients = Seq("abc@def.com", "xyz@def.com"))
    val nr2 = nr1.copy(id = 2, recipients = Seq("abc@ghi.com", "xyz@ghi.com"))
    val w = createWorkflow()

    when(notificationRuleService.getMatchingNotificationRules(eqTo(di.workflowId), eqTo(di.status))(any()))
      .thenReturn(Future(Some(Seq(nr1, nr2), w)))

    // when
    await(underTest.createNotifications(di, Seq(ji)))
    underTest.sendNotifications()

    // then
    val recipientsCaptor: ArgumentCaptor[Seq[String]] = ArgumentCaptor.forClass(classOf[Seq[String]])
    val messagesCaptor: ArgumentCaptor[String] = ArgumentCaptor.forClass(classOf[String])
    val expectedSubject = s"Hyperdrive Notifications, ${environment}: Workflow ${w.name} ${di.status.name}"
    val expectedMessageBase =
      raw"""Environment: TEST
           |Project: ${w.project}
           |Workflow Name: ${w.name}
           |Started: 2020-03-02T12:30:00
           |Finished: 2020-03-02T14:30:00
           |Status: Succeeded""".stripMargin
    val expectedMessage1 =
      raw"""${expectedMessageBase}
           |Notification rule ID: ${nr1.id}""".stripMargin
    val expectedMessage2 =
      raw"""${expectedMessageBase}
           |Notification rule ID: ${nr2.id}""".stripMargin

    verify(emailService, times(2)).sendMessageToBccRecipients(
      eqTo(senderAddress),
      recipientsCaptor.capture(),
      eqTo(expectedSubject),
      messagesCaptor.capture()
    )

    import scala.collection.JavaConverters._
    recipientsCaptor.getAllValues.asScala should contain theSameElementsAs Seq(nr1.recipients, nr2.recipients)
    val messages = messagesCaptor.getAllValues.asScala
    messages.head should startWith(expectedMessage1)
    messages(1) should startWith(expectedMessage2)
  }

  it should "add the application id of the last failed job instance" in {
    // given
    val di = createDagInstance().copy(
      status = DagInstanceStatuses.Failed,
      started = LocalDateTime.of(LocalDate.of(2020, 3, 2), LocalTime.of(12, 30)),
      finished = Some(LocalDateTime.of(LocalDate.of(2020, 3, 2), LocalTime.of(14, 30)))
    )
    val ji1 =
      createJobInstance().copy(jobStatus = JobStatuses.Failed, applicationId = Some("application_1234_4567"), order = 1)
    val ji2 =
      createJobInstance().copy(jobStatus = JobStatuses.Failed, applicationId = Some("application_9876_4567"), order = 2)

    val nr1 = createNotificationRule().copy(id = 1, recipients = Seq("abc@def.com", "xyz@def.com"))
    val w = createWorkflow()

    when(notificationRuleService.getMatchingNotificationRules(eqTo(di.workflowId), eqTo(di.status))(any()))
      .thenReturn(Future(Some(Seq(nr1), w)))

    // when
    await(underTest.createNotifications(di, Seq(ji2, ji1)))
    underTest.sendNotifications()

    // then
    val messagesCaptor: ArgumentCaptor[String] = ArgumentCaptor.forClass(classOf[String])
    verify(emailService).sendMessageToBccRecipients(any(), any(), any(), messagesCaptor.capture())
    messagesCaptor.getValue should include(s"Failed application: $clusterBaseUrl/cluster/app/application_9876_4567")
  }

  it should "retry sending the message at most maxRetries times" in {
    // given
    val maxRetries = 5
    val testService = createNotificationRuleService(maxRetries)
    val di = createDagInstance()
    val ji = createJobInstance().copy(jobStatus = JobStatuses.Succeeded)
    val nr1 = createNotificationRule().copy(id = 1, recipients = Seq("abc@def.com", "xyz@def.com"))
    val w = createWorkflow()

    when(notificationRuleService.getMatchingNotificationRules(eqTo(di.workflowId), eqTo(di.status))(any()))
      .thenReturn(Future(Some(Seq(nr1), w)))
    when(emailService.sendMessageToBccRecipients(any(), any(), any(), any())).thenThrow(new MailSendException("Fail"))

    // when
    await(testService.createNotifications(di, Seq(ji)))
    testService.sendNotifications()
    testService.sendNotifications()

    // then
    val expectedSubject = s"Hyperdrive Notifications, ${environment}: Workflow ${w.name} ${di.status.name}"
    verify(emailService, times(maxRetries)).sendMessageToBccRecipients(
      eqTo(senderAddress),
      any(),
      eqTo(expectedSubject),
      any()
    )
  }

  it should "send subsequent messages even if a previous message threw an exception" in {
    // given
    val di1 = createDagInstance().copy(status = DagInstanceStatuses.Succeeded)
    val di2 = createDagInstance().copy(status = DagInstanceStatuses.Failed)
    val ji = createJobInstance()

    val nr1 = createNotificationRule().copy(recipients = Seq("abc@xyz.com"))
    val nr2 = createNotificationRule().copy(recipients = Seq("def@xyz.com"))
    val w = createWorkflow()

    when(notificationRuleService.getMatchingNotificationRules(eqTo(di1.workflowId), eqTo(di1.status))(any()))
      .thenReturn(Future(Some(Seq(nr1), w)))
    when(notificationRuleService.getMatchingNotificationRules(eqTo(di2.workflowId), eqTo(di2.status))(any()))
      .thenReturn(Future(Some(Seq(nr2), w)))

    when(emailService.sendMessageToBccRecipients(any(), eqTo(nr1.recipients), any(), any()))
      .thenThrow(new RuntimeException("Fail"))

    // when
    await(underTest.createNotifications(di1, Seq(ji)))
    await(underTest.createNotifications(di2, Seq(ji)))
    underTest.sendNotifications()

    // then
    val expectedSubject1 = s"Hyperdrive Notifications, ${environment}: Workflow ${w.name} ${di1.status.name}"
    val expectedSubject2 = s"Hyperdrive Notifications, ${environment}: Workflow ${w.name} ${di2.status.name}"
    verify(emailService).sendMessageToBccRecipients(
      eqTo(senderAddress),
      eqTo(nr1.recipients),
      eqTo(expectedSubject1),
      any()
    )
    verify(emailService).sendMessageToBccRecipients(
      eqTo(senderAddress),
      eqTo(nr2.recipients),
      eqTo(expectedSubject2),
      any()
    )
  }

  private def createDagInstance() =
    DagInstance(
      status = DagInstanceStatuses.Succeeded,
      triggeredBy = "user",
      workflowId = 42,
      started = LocalDateTime.now().minusHours(2),
      finished = Some(LocalDateTime.now()),
      id = 142
    )

  private def createJobInstance() =
    JobInstance(
      jobName = "jobName",
      jobParameters = ShellInstanceParameters(scriptLocation = ""),
      jobStatus = InQueue,
      executorJobId = None,
      applicationId = None,
      stepId = None,
      created = LocalDateTime.now(),
      updated = None,
      order = 0,
      dagInstanceId = 0
    )

  private def createWorkflow() =
    Workflow(
      name = "workflow",
      isActive = true,
      version = 1,
      project = "project",
      created = LocalDateTime.now(),
      updated = None
    )

  private def createNotificationRule() =
    NotificationRule(
      true,
      Some("project"),
      Some("ABC XYZ"),
      None,
      Seq(DagInstanceStatuses.Skipped, DagInstanceStatuses.Failed),
      Seq("abc.def@ghi.com"),
      updated = None
    )

  private def createNotificationRuleService(maxRetries: Int = 1) =
    new NotificationSenderImpl(
      notificationRuleService,
      emailService,
      DefaultTestSparkConfig(hadoopResourceManagerUrlBase = clusterBaseUrl).yarn,
      TestNotificationConfig(enabled = true, senderAddress, maxRetries),
      TestGeneralConfig(environment = environment)
    )
}
