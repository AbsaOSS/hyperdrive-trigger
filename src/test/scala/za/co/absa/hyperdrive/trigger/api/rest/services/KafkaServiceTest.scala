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

package za.co.absa.hyperdrive.trigger.api.rest.services

import org.apache.kafka.clients.consumer.KafkaConsumer
import org.apache.kafka.common.{PartitionInfo, TopicPartition}
import org.mockito.ArgumentMatchers.{any, eq => eqTo}
import org.mockito.Mockito.when
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{FlatSpec, Matchers}
import za.co.absa.hyperdrive.trigger.configuration.application.{GeneralConfig, TestGeneralConfig}
import za.co.absa.hyperdrive.trigger.models.BeginningEndOffsets

import java.util.Properties

class KafkaServiceTest extends FlatSpec with MockitoSugar with Matchers {

  private val mockKafkaConsumer = mock[KafkaConsumer[String, String]]
  class KafkaServiceTestImpl(generalConfig: GeneralConfig) extends KafkaServiceImpl(generalConfig) {
    override def createKafkaConsumer(propertiesThreadId: (Properties, Long)): KafkaConsumer[String, String] =
      mockKafkaConsumer
  }
  private val underTest = new KafkaServiceTestImpl(TestGeneralConfig())

  "getEndOffsets" should "return a map of end offsets" in {
    import scala.collection.JavaConverters._
    val partitions = Seq(
      new PartitionInfo("topic", 0, null, null, null),
      new PartitionInfo("topic", 1, null, null, null)
    )
    val endOffsets = Map(
      new TopicPartition("topic", 0) -> long2Long(200L),
      new TopicPartition("topic", 1) -> long2Long(400L)
    ).asJava
    val topicPartitions = partitions.map(p => new TopicPartition(p.topic(), p.partition())).asJava

    when(mockKafkaConsumer.partitionsFor(any())).thenReturn(partitions.asJava)
    when(mockKafkaConsumer.endOffsets(eqTo(topicPartitions))).thenReturn(endOffsets)

    val result = underTest.getEndOffsets("topic", new Properties())

    result shouldBe Map(0 -> 200L, 1 -> 400L)
  }

  it should "return an empty map if partitionsFor returns null" in {
    when(mockKafkaConsumer.partitionsFor(any())).thenReturn(null)

    val result = underTest.getEndOffsets("non-existent-topic", new Properties())

    result shouldBe Map()
  }

  it should "return an empty map if getOffsets returns null" in {
    val partitionInfo = new PartitionInfo("topic", 0, null, null, null)
    import scala.collection.JavaConverters._
    val partitions = Seq(partitionInfo).asJava
    when(mockKafkaConsumer.partitionsFor(any())).thenReturn(partitions)
    when(mockKafkaConsumer.endOffsets(any())).thenReturn(null)

    val result = underTest.getEndOffsets("non-existent-topic", new Properties())

    result shouldBe Map()
  }

  "getOffsets" should "return a map of start and end offsets" in {
    import scala.collection.JavaConverters._
    val topicName = "topic"
    val partitions = Seq(
      new PartitionInfo(topicName, 0, null, null, null),
      new PartitionInfo(topicName, 1, null, null, null)
    )
    val endOffsets = Map(
      new TopicPartition(topicName, 0) -> long2Long(200L),
      new TopicPartition(topicName, 1) -> long2Long(400L)
    ).asJava
    val startOffsets = Map(
      new TopicPartition(topicName, 0) -> long2Long(100L),
      new TopicPartition(topicName, 1) -> long2Long(200L)
    ).asJava
    val topicPartitions = partitions.map(p => new TopicPartition(p.topic(), p.partition())).asJava

    when(mockKafkaConsumer.partitionsFor(any()))
      .thenReturn(partitions.asJava)
      .thenReturn(partitions.asJava)
    when(mockKafkaConsumer.beginningOffsets(eqTo(topicPartitions))).thenReturn(startOffsets)
    when(mockKafkaConsumer.endOffsets(eqTo(topicPartitions))).thenReturn(endOffsets)

    val result = underTest.getOffsets(topicName, new Properties())

    result shouldBe BeginningEndOffsets(topicName, Map(0 -> 100L, 1 -> 200L), Map(0 -> 200L, 1 -> 400L))
  }

  it should "return empty beginning and end offsets if partitionsFor returns null" in {
    val topicName = "non-existent-topic"
    when(mockKafkaConsumer.partitionsFor(any())).thenReturn(null)

    val result = underTest.getOffsets(topicName, new Properties())
    result shouldBe BeginningEndOffsets(topicName, Map.empty, Map.empty)
  }
}
