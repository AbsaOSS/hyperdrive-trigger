
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

package za.co.absa.hyperdrive.trigger.configuration

import java.io.{Closeable, PrintWriter}
import java.sql.{Connection, SQLFeatureNotSupportedException}
import java.util.logging.Logger

import javax.sql.DataSource
import slick.jdbc.JdbcDataSource

class DataSourceAdapter(jdbcDataSource: JdbcDataSource) extends DataSource with Closeable {
  override def getConnection: Connection = jdbcDataSource.createConnection()

  override def getConnection(username: String, password: String): Connection = throw new SQLFeatureNotSupportedException

  override def unwrap[T](iface: Class[T]): T = throw new SQLFeatureNotSupportedException

  override def isWrapperFor(iface: Class[_]): Boolean = throw new SQLFeatureNotSupportedException

  override def getLogWriter: PrintWriter = throw new SQLFeatureNotSupportedException

  override def setLogWriter(out: PrintWriter): Unit = throw new SQLFeatureNotSupportedException

  override def setLoginTimeout(seconds: Int): Unit = throw new SQLFeatureNotSupportedException

  override def getLoginTimeout: Int = throw new SQLFeatureNotSupportedException

  override def getParentLogger: Logger = throw new SQLFeatureNotSupportedException

  override def close(): Unit = jdbcDataSource.close()
}
