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

import org.apache.commons.io.IOUtils
import org.apache.hadoop.fs._
import org.apache.hadoop.security.UserGroupInformation
import org.apache.spark.deploy.SparkHadoopUtil
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

import java.nio.charset.StandardCharsets.UTF_8
import java.security.PrivilegedExceptionAction
import scala.io.Source
import scala.util.Try

trait HdfsService {
  def exists(path: Path)(implicit ugi: UserGroupInformation): Try[Boolean]
  def open(path: Path)(implicit ugi: UserGroupInformation): Try[FSDataInputStream]
  def listStatus(path: Path, filter: PathFilter)(implicit ugi: UserGroupInformation): Try[Array[FileStatus]]
  def parseFileAndClose[R](pathStr: String, parseFn: Iterator[String] => R)(
    implicit ugi: UserGroupInformation
  ): Try[Option[R]]
}

@Service
class HdfsServiceImpl extends HdfsService {
  private val logger = LoggerFactory.getLogger(this.getClass)
  private lazy val conf = SparkHadoopUtil.get.conf
  override def exists(path: Path)(implicit ugi: UserGroupInformation): Try[Boolean] = {
    Try {
      doAs {
        fs.exists(path)
      }
    }
  }

  override def open(path: Path)(implicit ugi: UserGroupInformation): Try[FSDataInputStream] = {
    Try {
      doAs {
        fs.open(path)
      }
    }
  }

  override def listStatus(path: Path, filter: PathFilter)(
    implicit ugi: UserGroupInformation
  ): Try[Array[FileStatus]] = {
    Try {
      doAs {
        fs.listStatus(path, filter)
      }
    }
  }

  /**
   *  @param pathStr path to the file as a string
   *  @param parseFn function that parses the file line by line. Caution: It must materialize the content,
   *                because the file is closed after the method completes. E.g. it must not return an iterator.
   *  @tparam R type of the parsed value
   *  @return None if the file doesn't exist, Some with the parsed content
   */
  override def parseFileAndClose[R](pathStr: String, parseFn: Iterator[String] => R)(
    implicit ugi: UserGroupInformation
  ): Try[Option[R]] = {
    for {
      path <- Try(new Path(pathStr))
      exists <- exists(path)
      parseResult <-
        if (exists) {
          open(path).map { input =>
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
          }

        } else {
          logger.debug(s"Could not find file $path")
          Try(None)
        }
    } yield parseResult
  }

  /**
   *  Must not be a lazy val, because different users should get different FileSystems. FileSystem is cached internally.
   */
  private def fs = FileSystem.get(conf)

  private def doAs[T](fn: => T)(implicit ugi: UserGroupInformation) = {
    ugi.doAs(new PrivilegedExceptionAction[T] {
      override def run(): T = {
        fn
      }
    })
  }
}
