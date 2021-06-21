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
import za.co.absa.hyperdrive.trigger.scheduler.utilities.JobDefinitionConfig.{KeysToMerge, MergedValuesSeparator}

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
      case (definitionParams: SparkDefinitionParameters, templateParams: SparkTemplateParameters) =>
        mergeSparkParameters(definitionParams, templateParams)
      case (definitionParams: HyperdriveDefinitionParameters, templateParams: SparkTemplateParameters) =>
        mergeSparkAndHyperdriveParameters(definitionParams, templateParams)
      case (definitionParams: ShellDefinitionParameters, templateParams: ShellTemplateParameters) =>
        mergeShellParameters(definitionParams, templateParams)
      case _ =>
        throw new IllegalArgumentException("Could not mix different job types.")
    }
  }

  private def mergeSparkAndHyperdriveParameters(definitionParams: HyperdriveDefinitionParameters, templateParams: SparkTemplateParameters): SparkInstanceParameters = {
    SparkInstanceParameters(
      jobJar = templateParams.jobJar.getOrElse(""),
      mainClass = templateParams.mainClass.getOrElse(""),
      appArguments = mergeLists(definitionParams.appArguments, templateParams.appArguments),
      additionalJars = mergeLists(definitionParams.additionalJars, templateParams.additionalJars),
      additionalFiles = mergeLists(definitionParams.additionalFiles, templateParams.additionalFiles),
      additionalSparkConfig = mergeMaps(definitionParams.additionalSparkConfig, templateParams.additionalSparkConfig, mergeSortedMapEntries)
    )
  }

  private def mergeSparkParameters(definitionParams: SparkDefinitionParameters, templateParams: SparkTemplateParameters): SparkInstanceParameters = {
    SparkInstanceParameters(
      jobJar = mergeOptionStrings(definitionParams.jobJar, templateParams.jobJar),
      mainClass = mergeOptionStrings(definitionParams.mainClass, templateParams.mainClass),
      appArguments = mergeLists(definitionParams.appArguments, templateParams.appArguments),
      additionalJars = mergeLists(definitionParams.additionalJars, templateParams.additionalJars),
      additionalFiles = mergeLists(definitionParams.additionalFiles, templateParams.additionalFiles),
      additionalSparkConfig = mergeMaps(definitionParams.additionalSparkConfig, templateParams.additionalSparkConfig, mergeSortedMapEntries)
    )
  }

  private def mergeShellParameters(definitionParams: ShellDefinitionParameters, templateParams: ShellTemplateParameters): ShellInstanceParameters = {
    ShellInstanceParameters(
      scriptLocation = definitionParams.scriptLocation.getOrElse(templateParams.scriptLocation.getOrElse(""))
    )
  }

  private def mergeOptionStrings(primary: Option[String], secondary: Option[String]) =
    primary.getOrElse(secondary.getOrElse(""))

  private def mergeLists(primary: List[String], secondary: List[String]) =
    secondary ++ primary

  private def mergeSortedMapEntries(key: String, firstValue: String, secondValue: String) = {
    if (KeysToMerge.contains(key)) {
      s"$secondValue$MergedValuesSeparator$firstValue".trim
    } else {
      firstValue
    }
  }

  private def mergeMaps[T](primary: Map[String, T], secondary: Map[String, T], mergeFn: (String, T, T) => T) = {
    val sharedKeys = primary.keySet.intersect(secondary.keySet)
    primary.filterKeys(key => !sharedKeys.contains(key)) ++
    secondary.filterKeys(key => !sharedKeys.contains(key)) ++
    primary.filterKeys(key => sharedKeys.contains(key))
        .map{ case (key, value) => key -> mergeFn.apply(key, value, secondary(key))}
  }
}
