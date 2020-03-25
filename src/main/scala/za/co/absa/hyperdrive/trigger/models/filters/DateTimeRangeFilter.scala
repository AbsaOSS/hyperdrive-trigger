
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

import java.time.LocalDateTime

import slick.jdbc.JdbcProfile
import slick.lifted.Rep

case class DateTimeRangeFilterAttributes(override val field: String,
                                         start: LocalDateTime,
                                         end: LocalDateTime
                                        ) extends FilterAttributes

object DateTimeRangeFilter {
  def apply(attributes: DateTimeRangeFilterAttributes, fields: Map[String, Rep[_]], profile: JdbcProfile): Rep[Boolean] = {
    val tableField = fields(attributes.field).asInstanceOf[Rep[LocalDateTime]]
    import profile.api._
    tableField >= attributes.start && tableField <= attributes.end
  }
}
