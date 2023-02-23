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

import org.apache.hadoop.fs.{Path, PathFilter}
import org.apache.hadoop.security.UserGroupInformation
import org.json4s.jackson.Serialization
import org.json4s.{Formats, NoTypeHints}
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.api.rest.utils.ScalaUtil.swap

import javax.inject.Inject
import scala.util.Try

trait CheckpointService {
  type TopicPartitionOffsets = Map[String, Map[Int, Long]]

  def getOffsetsFromFile(path: String)(implicit ugi: UserGroupInformation): Try[Option[TopicPartitionOffsets]]
  def getLatestOffsetFilePath(params: HdfsParameters)(
    implicit ugi: UserGroupInformation
  ): Try[Option[(String, Boolean)]]

  def getLatestCommittedOffset(params: HdfsParameters)(implicit ugi: UserGroupInformation): Try[Option[Map[Int, Long]]]
}

class HdfsParameters(
  val keytab: String,
  val principal: String,
  val checkpointLocation: String
)

@Lazy
@Service
class CheckpointServiceImpl @Inject() (@Lazy hdfsService: HdfsService) extends CheckpointService {
  private val logger = LoggerFactory.getLogger(this.getClass)
  private val offsetsDirName = "offsets"
  private val commitsDirName = "commits"
  private implicit val formats: Formats = Serialization.formats(NoTypeHints)

  /**
   *  See org.apache.spark.sql.execution.streaming.HDFSMetadataLog
   */
  private val batchFilesFilter = new PathFilter {
    override def accept(path: Path): Boolean = {
      try {
        path.getName.toLong
        true
      } catch {
        case _: NumberFormatException =>
          false
      }
    }
  }

  override def getOffsetsFromFile(
    path: String
  )(implicit ugi: UserGroupInformation): Try[Option[TopicPartitionOffsets]] = {
    hdfsService.parseFileAndClose(path, parseKafkaOffsetStream)
  }

  /**
   *  @return an Option of a String, Boolean pair. The string contains the path to the latest offset file, while the
   *         boolean is true if the offset is committed (i.e. a corresponding commit file exists), and false otherwise.
   *         None is returned if the offset file does not exist. If the offset file does not exist, the corresponding
   *         commit file is assumed to also not exist.
   */
  override def getLatestOffsetFilePath(
    params: HdfsParameters
  )(implicit ugi: UserGroupInformation): Try[Option[(String, Boolean)]] = {
    getLatestOffsetBatchId(params.checkpointLocation).flatMap { offsetBatchIdOpt =>
      val offsetFilePath = offsetBatchIdOpt.map { offsetBatchId =>
        getLatestCommitBatchId(params.checkpointLocation).map { commitBatchIdOpt =>
          val committed = commitBatchIdOpt match {
            case Some(commitBatchId) => offsetBatchId == commitBatchId
            case None                => false
          }
          val path = new Path(s"${params.checkpointLocation}/$offsetsDirName/$offsetBatchId")
          (path.toString, committed)
        }
      }
      if (offsetFilePath.isEmpty) {
        logger.debug(s"No offset files exist under checkpoint location ${params.checkpointLocation}")
      }
      swap(offsetFilePath)
    }
  }

  override def getLatestCommittedOffset(
    params: HdfsParameters
  )(implicit ugi: UserGroupInformation): Try[Option[Map[Int, Long]]] = {
    getLatestCommitBatchId(params.checkpointLocation).map {
      case Some(latestCommit) =>
        val pathToLatestCommit = new Path(s"${params.checkpointLocation}/$offsetsDirName/$latestCommit")
        getOffsetsFromFile(pathToLatestCommit.toString)
          .map(_.map(topicPartitionOffsets => topicPartitionOffsets.head._2))
      case None => Try(Option.empty[Map[Int, Long]])
    }.flatten
  }

  /**
   *  see org.apache.spark.sql.execution.streaming.OffsetSeqLog
   *  and org.apache.spark.sql.kafka010.JsonUtils
   *  for details on the assumed format
   */
  private def parseKafkaOffsetStream(lines: Iterator[String]): TopicPartitionOffsets = {
    val SERIALIZED_VOID_OFFSET = "-"
    def parseOffset(value: String): Option[TopicPartitionOffsets] = value match {
      case SERIALIZED_VOID_OFFSET => None
      case json                   => Some(Serialization.read[TopicPartitionOffsets](json))
    }
    if (!lines.hasNext) {
      throw new IllegalStateException("Incomplete log file")
    }

    lines.next() // skip version
    lines.next() // skip metadata
    lines
      .map(parseOffset)
      .filter(_.isDefined)
      .map(_.get)
      .toSeq
      .head
  }

  private def getLatestCommitBatchId(checkpointDir: String)(implicit ugi: UserGroupInformation): Try[Option[Long]] = {
    val commitsDir = new Path(s"$checkpointDir/$commitsDirName")
    getLatestBatchId(commitsDir)
  }

  private def getLatestOffsetBatchId(checkpointDir: String)(implicit ugi: UserGroupInformation): Try[Option[Long]] = {
    val offsetsDir = new Path(s"$checkpointDir/$offsetsDirName")
    getLatestBatchId(offsetsDir)
  }

  private def getLatestBatchId(path: Path)(implicit ugi: UserGroupInformation): Try[Option[Long]] = {
    hdfsService.exists(path).flatMap { exists =>
      if (exists) {
        hdfsService.listStatus(path, batchFilesFilter).map { statuses =>
          statuses
            .map { status =>
              status.getPath.getName.toLong
            }
            .sorted
            .lastOption

        }
      } else {
        logger.debug(s"Could not find path $path")
        Try(None)
      }
    }
  }
}
