
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

package za.co.absa.hyperdrive.trigger.scheduler.utilities.email

import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.{Component, Service}

trait EmailService {
  def sendMessageToBccRecipients(sender: String, recipients: Seq[String], subject: String, text: String)
}

@Service
class EmailServiceImpl(mailSender: JavaMailSender) extends EmailService {
  override def sendMessageToBccRecipients(sender: String, recipients: Seq[String], subject: String, text: String): Unit = {
    if (recipients.nonEmpty) {
      val message = new SimpleMailMessage()
      message.setFrom(sender)
      message.setBcc(recipients: _*)
      message.setSubject(subject)
      message.setText(text)
      mailSender.send(message)
    }
  }
}
