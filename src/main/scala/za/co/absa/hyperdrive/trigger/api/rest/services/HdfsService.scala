
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

trait HdfsService {
  type TopicPartitionOffsets = Map[String, Map[Int, Long]]

  def getLatestOffsetFile(params: GetLatestOffsetFileParams): Option[(String, Boolean)]

  def parseFileAndClose[R](pathStr: String, parseFn: Iterator[String] => R): Option[R]

  def getLatestCommitBatchId(checkpointDir: String): Option[Long]

  def getLatestOffsetBatchId(checkpointDir: String): Option[Long]
}

class GetLatestOffsetFileParams (
  val keytab: String,
  val principal: String,
  val checkpointLocation: String
)

@Service
class HdfsServiceImpl @Inject()(userGroupInformationWrapper: UserGroupInformationWrapper) extends HdfsService {
  private val logger = LoggerFactory.getLogger(this.getClass)
  private val mapper = new ObjectMapper().registerModule(DefaultScalaModule)
  private lazy val conf = SparkHadoopUtil.get.conf
  private lazy val fs = FileSystem.get(conf)

  /**
   * See org.apache.spark.sql.execution.streaming.HDFSMetadataLog
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

  override def getLatestOffsetFile(params: GetLatestOffsetFileParams): Option[(String, Boolean)] = {
    userGroupInformationWrapper.loginUserFromKeytab(params.principal, params.keytab)
    val commitBatchIdOpt = getLatestCommitBatchId(params.checkpointLocation)
    val offsetBatchIdOpt = getLatestOffsetBatchId(params.checkpointLocation)

    offsetBatchIdOpt.map { offsetBatchId =>
      val committed = commitBatchIdOpt match {
        case Some(commitBatchId) => offsetBatchId == commitBatchId
        case None => false
      }
      val path = new Path(s"${params.checkpointLocation}/${offsetBatchId}")
      (path.toString, committed)
    }
  }

  /**
   *
   * @param pathStr path to the file as a string
   * @param parseFn function that parses the file line by line. Caution: It must materialize the content,
   *                because the file is closed after the method completes. E.g. it must not return an iterator.
   * @tparam R type of the parsed value
   * @return None if the file doesn't exist, Some with the parsed content
   */
  override def parseFileAndClose[R](pathStr: String, parseFn: Iterator[String] => R): Option[R] = {
    val path = new Path(pathStr)
    if (fs.exists(path)) {
      val input = fs.open(path)
      try {
        val lines = Source.fromInputStream(input, UTF_8.name()).getLines()
        Some(parseFn(lines))
      } catch {
        case e: Exception =>
          // re-throw the exception with the log file path added
          throw new Exception(
            s"Failed to parse file $path. ${e.getMessage}", e)
      } finally {
        IOUtils.closeQuietly(input)
      }
    } else {
      logger.debug(s"Could not find file $path")
      None
    }
  }

  /**
   * see org.apache.spark.sql.execution.streaming.OffsetSeqLog
   * and org.apache.spark.sql.kafka010.JsonUtils
   * for details on the assumed format
   */
  def parseKafkaOffsetStream(lines: Iterator[String]): TopicPartitionOffsets = {
    val SERIALIZED_VOID_OFFSET = "-"
    def parseOffset(value: String): Option[TopicPartitionOffsets] = value match {
      case SERIALIZED_VOID_OFFSET => None
      case json => Some(mapper.readValue(json, classOf[TopicPartitionOffsets]))
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

  def getLatestCommitBatchId(checkpointDir: String): Option[Long] = {
    val commitsDir = new Path(s"$checkpointDir/commits")
    getLatestBatchId(commitsDir)
  }

  def getLatestOffsetBatchId(checkpointDir: String): Option[Long] = {
    val commitsDir = new Path(s"$checkpointDir/offsets")
    getLatestBatchId(commitsDir)
  }

  private def getLatestBatchId(path: Path): Option[Long] = {
    if (fs.exists(path)) {
      fs.listStatus(path, batchFilesFilter).map {
        status => status.getPath.getName.toLong
      }
        .sorted
        .lastOption
    } else {
      logger.debug(s"Could not find path $path")
      None
    }
  }
}
