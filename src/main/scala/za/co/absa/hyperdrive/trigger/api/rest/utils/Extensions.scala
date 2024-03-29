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

import za.co.absa.hyperdrive.trigger.models.AdditionalSparkConfig

object Extensions {
  implicit class SparkConfigList(list: List[AdditionalSparkConfig]) {
    def toKeyValueMap: Map[String, String] =
      list.map(element => element.key -> element.value).toMap
  }

  implicit class SparkConfigMap(map: Map[String, String]) {
    def toAdditionalSparkConfigList: List[AdditionalSparkConfig] =
      map.map(element => AdditionalSparkConfig(element._1, element._2)).toList
  }
}
