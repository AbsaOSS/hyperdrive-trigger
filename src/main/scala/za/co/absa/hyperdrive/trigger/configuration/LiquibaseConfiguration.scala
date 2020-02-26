
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
import liquibase.integration.spring.SpringLiquibase
import org.springframework.beans.factory.ObjectProvider
import org.springframework.boot.autoconfigure.liquibase.LiquibaseProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.{Bean, Configuration}

@Configuration
@EnableConfigurationProperties(Array(classOf[LiquibaseProperties] ) )
class LiquibaseConfiguration (properties: LiquibaseProperties, dataSourceProvider: ObjectProvider[DataSource]) {

  @Bean
  def liquibase: SpringLiquibase = {
    val dataSource = dataSourceProvider.getIfUnique
    val liquibase = new SpringLiquibase
    liquibase.setDataSource(dataSource)
    liquibase.setChangeLog(properties.getChangeLog)
    liquibase.setContexts(properties.getContexts)
    liquibase.setDefaultSchema(properties.getDefaultSchema)
    liquibase.setDropFirst(properties.isDropFirst)
    liquibase.setShouldRun(properties.isEnabled)
    liquibase.setLabels(properties.getLabels)
    liquibase.setChangeLogParameters(properties.getParameters)
    liquibase.setRollbackFile(properties.getRollbackFile)
    liquibase
  }
}
