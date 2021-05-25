
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

package za.co.absa.hyperdrive.trigger.configuration.liquibase

import liquibase.integration.spring.SpringLiquibase
import liquibase.{Contexts, LabelExpression, Liquibase}
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.liquibase.LiquibaseProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.{Bean, Configuration}
import za.co.absa.hyperdrive.trigger.persistance.Repository

@Configuration
@EnableConfigurationProperties(Array(classOf[LiquibaseProperties]))
class LiquibaseConfiguration(properties: LiquibaseProperties) extends SpringLiquibase with Repository {
  private val configLogger = LoggerFactory.getLogger(this.getClass)
  @Value("${db.skip.liquibase:false}")
  val skipLiquibase: Boolean = false

  @Bean
  // used to reference this class in the @DependsOn annotation
  def liquibaseConfigurationMarker(): Boolean = true

  override def afterPropertiesSet(): Unit = {
    if (!skipLiquibase) {
      configureLiquibase()
    } else {
      configLogger.info("Skipping Liquibase")
    }
  }

  private def configureLiquibase(): Unit = {
    configLogger.info("Configuring Liquibase")
    applyProperties(properties)
    val connection = db.source.createConnection()
    var liquibaseOpt: Option[Liquibase] = None
    try {
      liquibaseOpt = Option(createLiquibase(connection))
      liquibaseOpt match {
        case Some(liquibase) => updateMigrations(liquibase)
        case None => configLogger.error("Could not configure liquibase")
      }
    } finally {
      liquibaseOpt.flatMap(liquibase => Option(liquibase.getDatabase)) match {
        case Some(database) => database.close()
        case None => connection.close()
      }
    }
  }

  private def updateMigrations(liquibase: Liquibase): Unit = {
    val unrunChangeSets = liquibase.listUnrunChangeSets(new Contexts(contexts), new LabelExpression(labels))
    if (!unrunChangeSets.isEmpty) {
      liquibase.update(contexts)
    } else {
      configLogger.debug("Database schema is up-to-date")
    }
  }

  private def applyProperties(properties: LiquibaseProperties): Unit = {
    setChangeLog(properties.getChangeLog)
    setContexts(properties.getContexts)
    setDefaultSchema(properties.getDefaultSchema)
    setDropFirst(properties.isDropFirst)
    setShouldRun(properties.isEnabled)
    setLabels(properties.getLabels)
    setChangeLogParameters(properties.getParameters)
    setRollbackFile(properties.getRollbackFile)
  }
}
