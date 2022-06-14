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

package za.co.absa.hyperdrive.trigger.configuration.application

import java.util.Properties

private[application] object ConfigUtil {
  def toNonEmptyOption(string: String): Option[String] =
    Option(string).collect { case x if x.trim.nonEmpty => x }

  def splitString(value: String, regex: String): Seq[String] = Option(value)
    .map(_.split(regex).toSeq)
    .getOrElse(Seq())
    .filter(_.nonEmpty)

  def transformProperties(properties: Properties): Map[String, String] = {
    import scala.collection.JavaConverters._
    Option(properties)
      .map(_.asScala.toMap)
      .getOrElse(Map())
  }
}
