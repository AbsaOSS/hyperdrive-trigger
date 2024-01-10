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

package za.co.absa.hyperdrive.trigger.models.confluent

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.{DeserializationContext, JsonDeserializer, JsonNode}

import scala.collection.JavaConverters._

case class RoleBinding(resourceType: String, name: String, patternType: String, roleName: String)

class RoleBindingDeserializer extends JsonDeserializer[Seq[RoleBinding]] {
  override def deserialize(jp: JsonParser, ctxt: DeserializationContext): Seq[RoleBinding] = {
    val routeNode: JsonNode = jp.getCodec.readTree[JsonNode](jp)

    routeNode.elements().asScala.toList.flatMap { element =>
      val roleBindings = element.get("rolebindings").asScala

      roleBindings.flatMap { roleBinding =>
        roleBinding.fields().asScala.toArray.flatMap { field =>
          field.getValue.elements().asScala.toList.map { fieldElement =>
            RoleBinding(
              fieldElement.get("resourceType").asText(),
              fieldElement.get("name").asText(),
              fieldElement.get("patternType").asText(),
              field.getKey
            )
          }
        }
      }
    }
  }
}
