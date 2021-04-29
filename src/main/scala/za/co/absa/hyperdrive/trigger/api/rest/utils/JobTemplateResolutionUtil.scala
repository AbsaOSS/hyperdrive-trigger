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

import scala.collection.immutable.SortedMap
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
      jobType = jobTemplate.jobType,
      name = jobDefinition.name,
      jobParameters = mergeJobParameters(jobDefinition.jobParameters, jobTemplate.jobParameters),
      order = jobDefinition.order
    )
  }

  private def mergeJobParameters(primary: JobParameters, secondary: JobParametersTemplate): JobParameters = {
    primary
//    JobParameters(
//      variables = mergeMapsOfStrings(primary.variables, secondary.variables),
//      maps = mergeMapsOfLists(primary.maps, secondary.maps),
//      keyValuePairs = mergeMapsOfSortedMaps(primary.keyValuePairs, secondary.keyValuePairs)
//    )
  }

  private def mergeMapsOfStrings(primary: Map[String, String], secondary: Map[String, String]) =
    secondary ++ primary

  private def mergeMapsOfLists(primary: Map[String, List[String]], secondary: Map[String, List[String]]) =
    mergeMaps(primary, secondary, (_: String, first: List[String], second: List[String]) => second ++ first)

  private type KeyValueMap = SortedMap[String, String]
  private def mergeMapsOfSortedMaps(primary: Map[String, KeyValueMap], secondary: Map[String, KeyValueMap]) =
    mergeMaps(primary, secondary, (_: String, first: KeyValueMap, second: KeyValueMap) => {
      val mergedMap = mergeMaps(first, second, mergeSortedMapEntries)
      SortedMap(mergedMap.toArray: _*)
    })

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
