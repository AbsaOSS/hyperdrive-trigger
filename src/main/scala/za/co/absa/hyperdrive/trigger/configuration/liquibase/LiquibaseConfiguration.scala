
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

import javax.annotation.PostConstruct
import liquibase.integration.spring.SpringLiquibase
import liquibase.{Contexts, LabelExpression, Liquibase}
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.liquibase.LiquibaseProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.{ApplicationContext, ApplicationContextAware}
import org.springframework.context.annotation.Configuration
import za.co.absa.hyperdrive.trigger.persistance.Repository

@Configuration
@EnableConfigurationProperties(Array(classOf[LiquibaseProperties] ) )
class LiquibaseConfiguration(properties: LiquibaseProperties) extends SpringLiquibase with Repository {
  private val logger = LoggerFactory.getLogger(this.getClass)
  @Value("${db.ignore.outdated.schema:false}")
  val ignoreOutdatedSchema: Boolean = false

  override def afterPropertiesSet(): Unit = {
    applyProperties(properties)
    val connection = db.source.createConnection()
    var liquibaseOpt: Option[Liquibase] = None
    try {
      liquibaseOpt = Option(createLiquibase(connection))
      liquibaseOpt match {
        case Some(liquibase) => validateAllMigrationsApplied(liquibase)
        case None => logger.error("Could not configure liquibase")
      }
    } finally {
      liquibaseOpt.flatMap(liquibase => Option(liquibase.getDatabase)) match {
        case Some(database) => database.close()
        case None => connection.close()
      }
    }
  }

  private def validateAllMigrationsApplied(liquibase: Liquibase): Unit = {
    val unrunChangeSets = liquibase.listUnrunChangeSets(new Contexts(contexts), new LabelExpression(labels))
    if (!unrunChangeSets.isEmpty) {
      val message = s"Not all database changesets have been applied. Unrun changesets: $unrunChangeSets"
      if (ignoreOutdatedSchema) {
        logger.warn(message)
      } else {
        liquibase.update(contexts)
      }
    } else {
      logger.debug("Database schema is up-to-date")
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
