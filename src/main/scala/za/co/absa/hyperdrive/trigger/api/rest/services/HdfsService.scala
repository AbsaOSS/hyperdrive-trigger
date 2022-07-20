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

import org.apache.hadoop.fs._
import org.apache.hadoop.security.UserGroupInformation
import org.apache.spark.deploy.SparkHadoopUtil
import org.springframework.stereotype.Service

import java.security.PrivilegedExceptionAction
import scala.util.Try

trait HdfsService {
  def exists(path: Path)(implicit ugi: UserGroupInformation): Try[Boolean]
  def open(path: Path)(implicit ugi: UserGroupInformation): Try[FSDataInputStream]
  def listStatus(path: Path, filter: PathFilter)(implicit ugi: UserGroupInformation): Try[Array[FileStatus]]
}

@Service
class HdfsServiceImpl extends HdfsService {
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

  override def listStatus(path: Path, filter: PathFilter)(implicit
    ugi: UserGroupInformation
  ): Try[Array[FileStatus]] = {
    Try {
      doAs {
        fs.listStatus(path, filter)
      }
    }
  }

  private def fs = FileSystem.get(conf)

  private def doAs[T](fn: => T)(implicit ugi: UserGroupInformation) = {
    ugi.doAs(new PrivilegedExceptionAction[T] {
      override def run(): T = {
        fn
      }
    })
  }
}
