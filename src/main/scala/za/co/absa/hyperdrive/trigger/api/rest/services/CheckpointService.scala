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

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import org.apache.commons.io.IOUtils
import org.apache.hadoop.fs.{FileSystem, Path, PathFilter}
import org.apache.spark.deploy.SparkHadoopUtil
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

import java.nio.charset.StandardCharsets.UTF_8
import javax.inject.Inject
import scala.io.Source

trait CheckpointService {
  type TopicPartitionOffsets = Map[String, Map[Int, Long]]

  def getOffsetsFromFile(path: String): Option[TopicPartitionOffsets]
  def getLatestOffsetFilePath(params: HdfsParameters): Option[(String, Boolean)]
  def loginUserFromKeytab(principal: String, keytab: String): Unit
}

class HdfsParameters(
  val keytab: String,
  val principal: String,
  val checkpointLocation: String
)

@Service
class CheckpointServiceImpl @Inject()(userGroupInformationWrapper: UserGroupInformationWrapper) extends CheckpointService {
  private val logger = LoggerFactory.getLogger(this.getClass)
  private val mapper = new ObjectMapper().registerModule(DefaultScalaModule)
  private val offsetsDirName = "offsets"
  private val commitsDirName = "commits"
  private lazy val conf = SparkHadoopUtil.get.conf
  private lazy val fs = FileSystem.get(conf)

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

  override def getOffsetsFromFile(path: String): Option[TopicPartitionOffsets] = {
    parseFileAndClose(path, parseKafkaOffsetStream)
  }

  /**
   *  @return an Option of a String, Boolean pair. The string contains the path to the latest offset file, while the
   *         boolean is true if the offset is committed (i.e. a corresponding commit file exists), and false otherwise.
   *         None is returned if the offset file does not exist. If the offset file does not exist, the corresponding
   *         commit file is assumed to also not exist.
   */
  override def getLatestOffsetFilePath(params: HdfsParameters): Option[(String, Boolean)] = {
    val offsetBatchIdOpt = getLatestOffsetBatchId(params.checkpointLocation)
    val offsetFilePath = offsetBatchIdOpt.map { offsetBatchId =>
      val commitBatchIdOpt = getLatestCommitBatchId(params.checkpointLocation)
      val committed = commitBatchIdOpt match {
        case Some(commitBatchId) => offsetBatchId == commitBatchId
        case None                => false
      }
      val path = new Path(s"${params.checkpointLocation}/${offsetsDirName}/${offsetBatchId}")
      (path.toString, committed)
    }
    if (offsetFilePath.isEmpty) {
      logger.debug(s"No offset files exist under checkpoint location ${params.checkpointLocation}")
    }
    offsetFilePath
  }

  override def loginUserFromKeytab(principal: String, keytab: String): Unit = {
    userGroupInformationWrapper.loginUserFromKeytab(principal, keytab)
  }

  /**
   *  @param pathStr path to the file as a string
   *  @param parseFn function that parses the file line by line. Caution: It must materialize the content,
   *                because the file is closed after the method completes. E.g. it must not return an iterator.
   *  @tparam R type of the parsed value
   *  @return None if the file doesn't exist, Some with the parsed content
   */
  private def parseFileAndClose[R](pathStr: String, parseFn: Iterator[String] => R): Option[R] = {
    val path = new Path(pathStr)
    if (fs.exists(path)) {
      val input = fs.open(path)
      try {
        val lines = Source.fromInputStream(input, UTF_8.name()).getLines()
        Some(parseFn(lines))
      } catch {
        case e: Exception =>
          // re-throw the exception with the log file path added
          throw new Exception(s"Failed to parse file $path", e)
      } finally {
        IOUtils.closeQuietly(input)
      }
    } else {
      logger.debug(s"Could not find file $path")
      None
    }
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
      case json                   => Some(mapper.readValue(json, classOf[TopicPartitionOffsets]))
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

  private def getLatestCommitBatchId(checkpointDir: String): Option[Long] = {
    val commitsDir = new Path(s"$checkpointDir/$commitsDirName")
    getLatestBatchId(commitsDir)
  }

  private def getLatestOffsetBatchId(checkpointDir: String): Option[Long] = {
    val offsetsDir = new Path(s"$checkpointDir/$offsetsDirName")
    getLatestBatchId(offsetsDir)
  }

  private def getLatestBatchId(path: Path): Option[Long] = {
    if (fs.exists(path)) {
      fs.listStatus(path, batchFilesFilter)
        .map { status =>
          status.getPath.getName.toLong
        }
        .sorted
        .lastOption
    } else {
      logger.debug(s"Could not find path $path")
      None
    }
  }
}
