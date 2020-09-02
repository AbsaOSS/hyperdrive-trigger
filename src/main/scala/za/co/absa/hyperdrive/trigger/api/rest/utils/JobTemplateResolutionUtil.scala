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

import java.time.LocalDateTime

import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.InQueue
import za.co.absa.hyperdrive.trigger.models._

import scala.collection.immutable.SortedMap


object JobTemplateResolutionUtil {

  def resolveDagDefinitionJoined(dagDefinitionJoined: DagDefinitionJoined, jobTemplates: Seq[JobTemplate]): DagInstanceJoined = {
    val jobTemplatesLookup = jobTemplates.map(t => t.id -> t).toMap
    DagInstanceJoined(
      status = DagInstanceStatuses.InQueue,
      workflowId = dagDefinitionJoined.workflowId,
      jobInstances = dagDefinitionJoined.jobDefinitions.map(jd => resolveJobDefinition(jd, jobTemplatesLookup(jd.jobTemplateId))),
      started = LocalDateTime.now(),
      finished = None
    )
  }

  private def resolveJobDefinition(jobDefinition: JobDefinition, jobTemplate: JobTemplate): JobInstance = {
    JobInstance(
      jobName = jobDefinition.name,
      jobType = jobTemplate.jobType,
      jobParameters = mergeJobParameters(jobDefinition.jobParameters, jobTemplate.jobParameters),
      jobStatus = InQueue,
      executorJobId = None,
      created = LocalDateTime.now(),
      updated = None,
      order = jobDefinition.order,
      dagInstanceId = 0
    )
  }

  private def mergeJobParameters(primary: JobParameters, secondary: JobParameters): JobParameters = {
    JobParameters(
      variables = mergeMapsOfStrings(primary.variables, secondary.variables),
      maps = mergeMapsOfLists(primary.maps, secondary.maps),
      keyValuePairs = mergeMapsOfSortedMaps(primary.keyValuePairs, secondary.keyValuePairs)
    )
  }

  private def mergeMapsOfStrings(primary: Map[String, String], secondary: Map[String, String]) =
    secondary ++ primary

  private def mergeMapsOfLists(primary: Map[String, List[String]], secondary: Map[String, List[String]]) =
    mergeMapsOfIterables(primary, secondary, (first: List[String], second: List[String]) => second ++ first)

  private def mergeMapsOfSortedMaps(primary: Map[String, SortedMap[String, String]],
    secondary: Map[String, SortedMap[String, String]]) =
    mergeMapsOfIterables(primary, secondary,
      (first: SortedMap[String, String], second: SortedMap[String, String]) => second ++ first)

  private def mergeMapsOfIterables[T <: Iterable[_]](primary: Map[String, T], secondary: Map[String, T], mergeFn: (T, T) => T) = {
    val sharedKeys = primary.keySet.intersect(secondary.keySet)
    primary.filterKeys(key => !sharedKeys.contains(key)) ++
    secondary.filterKeys(key => !sharedKeys.contains(key)) ++
    primary.filterKeys(key => sharedKeys.contains(key))
        .map{ case (key, iterable) => key -> mergeFn.apply(iterable, secondary(key)) }
  }
}
