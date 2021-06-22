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

package za.co.absa.hyperdrive.trigger.models.enums

import play.api.libs.json.{Format, JsPath, JsString, Writes}

object FormConfigs {

  sealed abstract class FormConfig(val name: String) {
    override def toString: String = name
  }

  case object Spark extends FormConfig("Spark")
  case object Shell extends FormConfig("Shell")
  case object Hyperdrive extends FormConfig("Hyperdrive")

  val formConfigs: Set[FormConfig] = Set(Spark, Shell, Hyperdrive)

  def convertFormConfigNameToFormConfig(formConfig: String): FormConfig = {
    FormConfigs.formConfigs.find(_.name == formConfig).getOrElse(
      throw new Exception(s"Couldn't find FormConfig: $formConfig")
    )
  }

  implicit val formConfigFormat: Format[FormConfig] = Format[FormConfig](
    JsPath.read[String].map(convertFormConfigNameToFormConfig),
    Writes[FormConfig] { formConfig => JsString(formConfig.name) }
  )
}