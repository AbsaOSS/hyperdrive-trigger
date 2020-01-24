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

package za.co.absa.hyperdrive.trigger.scheduler.utilities

import java.time.Duration

import org.apache.kafka.clients.consumer.{ConsumerRecord, KafkaConsumer}
import org.apache.kafka.common.TopicPartition

import scala.collection.JavaConverters._
import scala.collection.mutable

object KafkaRichConsumer {

  implicit class RichKafkaConsumer[A, B](kafkaConsumer: KafkaConsumer[A, B]) extends {

    def seek(): Unit = {
      for {
        topicPartition <- kafkaConsumer.assignmentAsScala()
        pollPosition = kafkaConsumer.position(topicPartition)
        committedPosition = kafkaConsumer.committed(topicPartition).offset()
        if pollPosition > committedPosition
      } yield {
        kafkaConsumer.seek(topicPartition, committedPosition)
      }
    }

    def pollAsScala(timeout: Duration): Iterable[ConsumerRecord[A, B]] = kafkaConsumer.poll(timeout).asScala

    def assignmentAsScala(): mutable.Set[TopicPartition] = kafkaConsumer.assignment().asScala

  }

}
