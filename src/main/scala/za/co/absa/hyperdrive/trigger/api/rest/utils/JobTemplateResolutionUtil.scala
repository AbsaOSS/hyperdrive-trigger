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

package za.co.absa.hyperdrive.trigger.api.rest.utils

import za.co.absa.hyperdrive.trigger.models._
import scala.util.{Failure, Success, Try}


object JobTemplateResolutionUtil {

  def resolveDagDefinitionJoined(dagDefinitionJoined: DagDefinitionJoined, jobTemplates: Seq[JobTemplate]): Seq[ResolvedJobDefinition] = {
    val jobTemplatesLookup = jobTemplates.map(t => t.id -> t).toMap
    dagDefinitionJoined.jobDefinitions.map(jd => {
      val jobTemplate = Try(jobTemplatesLookup(jd.jobTemplateId)) match {
        case Success(value) => value
        case Failure(_) => throw new NoSuchElementException(s"Couldn't find template with id ${jd.jobTemplateId}")
      }
      resolveJobDefinition(jd, jobTemplate)
    })
  }

  private def resolveJobDefinition(jobDefinition: JobDefinition, jobTemplate: JobTemplate): ResolvedJobDefinition = {
    ResolvedJobDefinition(
      name = jobDefinition.name,
      jobParameters = mergeJobParameters(jobDefinition.jobParameters, jobTemplate.jobParameters),
      order = jobDefinition.order
    )
  }

  private def mergeJobParameters(primary: JobDefinitionParameters, secondary: JobTemplateParameters): JobInstanceParameters = {
    (primary, secondary) match {
      case (definitionParams: SparkDefinitionParameters, templatePrams: SparkTemplateParameters) =>
        mergeSparkParameters(definitionParams, templatePrams)
      case (definitionParams: HyperdriveDefinitionParameters, templatePrams: SparkTemplateParameters) =>
        mergeSparkAndHyperdriveParameters(definitionParams, templatePrams)
      case (definitionParams: ShellDefinitionParameters, templatePrams: ShellTemplateParameters) =>
        mergeShellParameters(definitionParams, templatePrams)
      case _ =>
        throw new IllegalArgumentException("Couldn't not mix different job types.")
    }
  }

  private def mergeSparkAndHyperdriveParameters(definitionParams: HyperdriveDefinitionParameters, templatePrams: SparkTemplateParameters): SparkInstanceParameters = {
    SparkInstanceParameters(
      jobJar = templatePrams.jobJar.getOrElse(""),
      mainClass = templatePrams.mainClass.getOrElse(""),
      appArguments = mergeLists(definitionParams.appArguments, templatePrams.appArguments),
      additionalJars = mergeLists(definitionParams.additionalJars, templatePrams.additionalJars),
      additionalFiles = mergeLists(definitionParams.additionalFiles, templatePrams.additionalFiles),
      additionalSparkConfig = mergeMapsOfStrings(definitionParams.additionalSparkConfig, templatePrams.additionalSparkConfig)
    )
  }

  private def mergeSparkParameters(definitionParams: SparkDefinitionParameters, templatePrams: SparkTemplateParameters): SparkInstanceParameters = {
    SparkInstanceParameters(
      jobJar = mergeOptionStrings(definitionParams.jobJar, templatePrams.jobJar),
      mainClass = mergeOptionStrings(definitionParams.mainClass, templatePrams.mainClass),
      appArguments = mergeLists(definitionParams.appArguments, templatePrams.appArguments),
      additionalJars = mergeLists(definitionParams.additionalJars, templatePrams.additionalJars),
      additionalFiles = mergeLists(definitionParams.additionalFiles, templatePrams.additionalFiles),
      additionalSparkConfig = mergeMapsOfStrings(definitionParams.additionalSparkConfig, templatePrams.additionalSparkConfig)
    )
  }

  private def mergeShellParameters(definitionParams: ShellDefinitionParameters, templatePrams: ShellTemplateParameters): ShellInstanceParameters = {
    ShellInstanceParameters(
      scriptLocation = definitionParams.scriptLocation.getOrElse(templatePrams.scriptLocation.getOrElse(""))
    )
  }

  private def mergeOptionStrings(primary: Option[String], secondary: Option[String]) =
    primary.getOrElse(secondary.getOrElse(""))

  private def mergeLists(primary: List[String], secondary: List[String]) =
    secondary ++ primary

  private def mergeMapsOfStrings(primary: Map[String, String], secondary: Map[String, String]) =
    secondary ++ primary
}
