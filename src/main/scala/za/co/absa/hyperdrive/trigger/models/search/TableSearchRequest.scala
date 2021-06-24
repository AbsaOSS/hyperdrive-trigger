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

package za.co.absa.hyperdrive.trigger.models.search

case class TableSearchRequest(
  containsFilterAttributes: Option[Seq[ContainsFilterAttributes]] = None,
  intRangeFilterAttributes: Option[Seq[IntRangeFilterAttributes]] = None,
  dateTimeRangeFilterAttributes: Option[Seq[DateTimeRangeFilterAttributes]] = None,
  equalsMultipleFilterAttributes: Option[Seq[EqualsMultipleFilterAttributes]] = None,
  longFilterAttributes: Option[Seq[LongFilterAttributes]] = None,
  booleanFilterAttributes: Option[Seq[BooleanFilterAttributes]] = None,
  sort: Option[SortAttributes],
  from: Int,
  size: Int
) {
  def getContainsFilterAttributes: Seq[ContainsFilterAttributes] = containsFilterAttributes.getOrElse(Seq())
  def getIntRangeFilterAttributes: Seq[IntRangeFilterAttributes] = intRangeFilterAttributes.getOrElse(Seq())
  def getDateTimeRangeFilterAttributes: Seq[DateTimeRangeFilterAttributes] = dateTimeRangeFilterAttributes.getOrElse(Seq())
  def getEqualsMultipleFilterAttributes: Seq[EqualsMultipleFilterAttributes] = equalsMultipleFilterAttributes.getOrElse(Seq())
  def getLongFilterAttributes: Seq[LongFilterAttributes] = longFilterAttributes.getOrElse(Seq())
  def getBooleanFilterAttributes: Seq[BooleanFilterAttributes] = booleanFilterAttributes.getOrElse(Seq())
}
