
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

import javax.sql.DataSource
import org.springframework.context.annotation.{Bean, Configuration}
import slick.jdbc.{JdbcProfile, PostgresProfile}

@Configuration
class DatabaseConfiguration {

  // for Liquibase
  @Bean
  def dataSource: DataSource = {
    lazy val db = DatabaseConfiguration.db
    new DataSourceAdapter(db.source)
  }
}

object DatabaseConfiguration {
  val profile: JdbcProfile = PostgresDB.profile
  lazy val db = PostgresDB.db
}

private[configuration] object PostgresDB {
  val profile: JdbcProfile = PostgresProfile
  lazy val db: profile.backend.DatabaseDef = profile.api.Database.forConfig("db")
}