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

import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.configuration.application.JobDefinitionConfig.{KeysToMerge, MergedValuesSeparator}
import za.co.absa.hyperdrive.trigger.models._
import za.co.absa.hyperdrive.trigger.api.rest.utils.Extensions.{SparkConfigList, SparkConfigMap}

import scala.util.{Failure, Success, Try}

trait JobTemplateResolutionService {
  def resolveDagDefinitionJoined(
    dagDefinitionJoined: DagDefinitionJoined,
    jobTemplates: Seq[JobTemplate]
  ): Seq[ResolvedJobDefinition]
}

@Service
class JobTemplateResolutionServiceImpl extends JobTemplateResolutionService {
  def resolveDagDefinitionJoined(
    dagDefinitionJoined: DagDefinitionJoined,
    jobTemplates: Seq[JobTemplate]
  ): Seq[ResolvedJobDefinition] = {
    val jobTemplatesLookup = jobTemplates.map(t => t.id -> t).toMap
    dagDefinitionJoined.jobDefinitions.map {
      case jd @ JobDefinition(_, Some(jobTemplateId), _, _, _, _) =>
        val jobTemplate = Try(jobTemplatesLookup(jobTemplateId)) match {
          case Success(value) => value
          case Failure(_)     => throw new NoSuchElementException(s"Couldn't find template with id ${jobTemplateId}")
        }
        resolveJobDefinition(jd, jobTemplate)
      case jd @ JobDefinition(_, None, _, _, _, _) => resolveJobDefinition(jd)
    }
  }

  private def resolveJobDefinition(jobDefinition: JobDefinition): ResolvedJobDefinition = {
    val jobParameters = jobDefinition.jobParameters match {
      case SparkDefinitionParameters(
            jobType,
            jobJar,
            mainClass,
            appArguments,
            additionalJars,
            additionalFiles,
            additionalSparkConfig
          ) =>
        SparkInstanceParameters(
          jobType = jobType,
          jobJar = jobJar.getOrElse(""),
          mainClass = mainClass.getOrElse(""),
          appArguments = appArguments,
          additionalJars = additionalJars,
          additionalFiles = additionalFiles,
          additionalSparkConfig = additionalSparkConfig
        )
      case ShellDefinitionParameters(_, scriptLocation) =>
        ShellInstanceParameters(scriptLocation = scriptLocation.getOrElse(""))
    }

    ResolvedJobDefinition(name = jobDefinition.name, jobParameters = jobParameters, order = jobDefinition.order)
  }

  private def resolveJobDefinition(jobDefinition: JobDefinition, jobTemplate: JobTemplate): ResolvedJobDefinition =
    ResolvedJobDefinition(
      name = jobDefinition.name,
      jobParameters = mergeJobParameters(jobDefinition.jobParameters, jobTemplate.jobParameters),
      order = jobDefinition.order
    )

  private def mergeJobParameters(
    primary: JobDefinitionParameters,
    secondary: JobTemplateParameters
  ): JobInstanceParameters =
    (primary, secondary) match {
      case (definitionParams: SparkDefinitionParameters, templateParams: SparkTemplateParameters) =>
        mergeSparkParameters(definitionParams, templateParams)
      case (definitionParams: ShellDefinitionParameters, templateParams: ShellTemplateParameters) =>
        mergeShellParameters(definitionParams, templateParams)
      case _ =>
        throw new IllegalArgumentException("Could not mix different job types.")
    }

  private def mergeSparkParameters(
    definitionParams: SparkDefinitionParameters,
    templateParams: SparkTemplateParameters
  ): SparkInstanceParameters =
    SparkInstanceParameters(
      jobJar = mergeOptionString(definitionParams.jobJar, templateParams.jobJar),
      mainClass = mergeOptionString(definitionParams.mainClass, templateParams.mainClass),
      appArguments = mergeLists(definitionParams.appArguments, templateParams.appArguments),
      additionalJars = mergeLists(definitionParams.additionalJars, templateParams.additionalJars),
      additionalFiles = mergeLists(definitionParams.additionalFiles, templateParams.additionalFiles),
      additionalSparkConfig = mergeMaps(
        definitionParams.additionalSparkConfig.toKeyValueMap,
        templateParams.additionalSparkConfig.toKeyValueMap,
        mergeSortedMapEntries
      ).toAdditionalSparkConfigList
    )

  private def mergeShellParameters(
    definitionParams: ShellDefinitionParameters,
    templateParams: ShellTemplateParameters
  ): ShellInstanceParameters =
    ShellInstanceParameters(scriptLocation = definitionParams.scriptLocation.getOrElse(templateParams.scriptLocation))

  private def mergeOptionString(primary: Option[String], secondary: String): String =
    primary.getOrElse(secondary)

  private def mergeLists(primary: List[String], secondary: List[String]): List[String] =
    secondary ++ primary

  private def mergeSortedMapEntries(key: String, firstValue: String, secondValue: String): String =
    if (KeysToMerge.contains(key)) {
      s"$secondValue$MergedValuesSeparator$firstValue".trim
    } else {
      firstValue
    }

  private def mergeMaps[T](primary: Map[String, T], secondary: Map[String, T], mergeFn: (String, T, T) => T) = {
    val sharedKeys = primary.keySet.intersect(secondary.keySet)
    primary.filterKeys(key => !sharedKeys.contains(key)) ++
      secondary.filterKeys(key => !sharedKeys.contains(key)) ++
      primary
        .filterKeys(key => sharedKeys.contains(key))
        .map { case (key, value) => key -> mergeFn.apply(key, value, secondary(key)) }
  }
}
