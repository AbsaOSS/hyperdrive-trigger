
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

package za.co.absa.hyperdrive.trigger.models.filters

trait FilterSearchRequest {
  val stringEqualsFilterAttributes: Option[Seq[StringEqualsFilterAttributes]]
  val containsFilterAttributes: Option[Seq[ContainsFilterAttributes]]
  val intRangeFilterAttributes: Option[Seq[IntRangeFilterAttributes]]
  val dateTimeRangeFilterAttributes: Option[Seq[DateTimeRangeFilterAttributes]]

  def getStringEqualsFilterAttributes: Seq[StringEqualsFilterAttributes] = stringEqualsFilterAttributes.getOrElse(Seq())
  def getContainsFilterAttributes: Seq[ContainsFilterAttributes] = containsFilterAttributes.getOrElse(Seq())
  def getIntRangeFilterAttributes: Seq[IntRangeFilterAttributes] = intRangeFilterAttributes.getOrElse(Seq())
  def getDateTimeRangeFilterAttributes: Seq[DateTimeRangeFilterAttributes] = dateTimeRangeFilterAttributes.getOrElse(Seq())
}
