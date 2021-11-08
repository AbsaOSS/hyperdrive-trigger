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

package za.co.absa.hyperdrive.trigger.api.rest

import com.fasterxml.jackson.core.{JsonGenerator, JsonParser}
import com.fasterxml.jackson.databind.module.SimpleModule
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import play.api.libs.json.Json
import za.co.absa.hyperdrive.trigger.models.{JobDefinitionParameters, JobTemplateParameters, SensorProperties}
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses.DagInstanceStatus
import za.co.absa.hyperdrive.trigger.models.enums.FormConfigs.FormConfig
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.JobStatus
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes.JobType
import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes.SensorType
import za.co.absa.hyperdrive.trigger.models.enums.{DagInstanceStatuses, FormConfigs, JobStatuses, JobTypes, SensorTypes}
import com.fasterxml.jackson.databind._


object ObjectMapperSingleton {
  private class SensorTypesDeserializer extends JsonDeserializer[SensorType] {
    override def deserialize(p: JsonParser, ctxt: DeserializationContext): SensorType = {
      val node = p.getCodec.readTree[JsonNode](p)
      val value = node.get("name").textValue()
      SensorTypes.sensorTypes.find(_.name == value).getOrElse(throw new Exception("Failed to find enum value"))
    }
  }

  private class JobStatusesDeserializer extends JsonDeserializer[JobStatus] {
    override def deserialize(p: JsonParser, ctxt: DeserializationContext): JobStatus = {
      val node = p.getCodec.readTree[JsonNode](p)
      val value = node.get("name").textValue()
      JobStatuses.statuses.find(_.name == value).getOrElse(throw new Exception("Failed to find enum value"))
    }
  }

  private class JobTypesDeserializer extends JsonDeserializer[JobType] {
    override def deserialize(p: JsonParser, ctxt: DeserializationContext): JobType = {
      val node = p.getCodec.readTree[JsonNode](p)
      val value = node.get("name").textValue()
      JobTypes.jobTypes.find(_.name == value).getOrElse(throw new Exception("Failed to find enum value"))
    }
  }

  private class DagInstanceStatusesDeserializer extends JsonDeserializer[DagInstanceStatus] {
    override def deserialize(p: JsonParser, ctxt: DeserializationContext): DagInstanceStatus = {
      val node = p.getCodec.readTree[JsonNode](p)
      val value = node.textValue()
      DagInstanceStatuses.statuses.find(_.name == value).getOrElse(throw new Exception("Failed to find enum value"))
    }
  }

  private class DagInstanceStatusesSerializer extends JsonSerializer[DagInstanceStatus] {
    override def serialize(value: DagInstanceStatus, jsonGenerator: JsonGenerator, serializerProvider: SerializerProvider): Unit = {
      jsonGenerator.writeString(value.name)
    }
  }

  private class JobDefinitionParametersDeserializer extends JsonDeserializer[JobDefinitionParameters] {
    override def deserialize(p: JsonParser, ctxt: DeserializationContext): JobDefinitionParameters = {
      val node = p.getCodec.readTree[JsonNode](p)
      Json.parse(node.toString).as[JobDefinitionParameters]
    }
  }

  private class JobDefinitionParametersSerializer extends JsonSerializer[JobDefinitionParameters] {
    override def serialize(value: JobDefinitionParameters, jsonGenerator: JsonGenerator, serializerProvider: SerializerProvider): Unit = {
      jsonGenerator.writeRawValue(Json.toJson(value).toString())
    }
  }

  private class JobTemplateParametersDeserializer extends JsonDeserializer[JobTemplateParameters] {
    override def deserialize(p: JsonParser, ctxt: DeserializationContext): JobTemplateParameters = {
      val node = p.getCodec.readTree[JsonNode](p)
      Json.parse(node.toString).as[JobTemplateParameters]
    }
  }

  private class JobTemplateParametersSerializer extends JsonSerializer[JobTemplateParameters] {
    override def serialize(value: JobTemplateParameters, jsonGenerator: JsonGenerator, serializerProvider: SerializerProvider): Unit = {
      jsonGenerator.writeRawValue(Json.toJson(value).toString())
    }
  }

  private class FormConfigDeserializer extends JsonDeserializer[FormConfig] {
    override def deserialize(p: JsonParser, ctxt: DeserializationContext): FormConfig = {
      val node = p.getCodec.readTree[JsonNode](p)
      val value = node.textValue()
      FormConfigs.formConfigs.find(_.name == value).getOrElse(throw new Exception("Failed to find enum value"))
    }
  }

  private class FormConfigSerializer extends JsonSerializer[FormConfig] {
    override def serialize(value: FormConfig, jsonGenerator: JsonGenerator, serializerProvider: SerializerProvider): Unit = {
      jsonGenerator.writeString(value.name)
    }
  }

  private class SensorPropertiesDeserializer extends JsonDeserializer[SensorProperties] {
    override def deserialize(p: JsonParser, ctxt: DeserializationContext): SensorProperties = {
      val node = p.getCodec.readTree[JsonNode](p)
      Json.parse(node.toString).as[SensorProperties]
    }
  }

  private class SensorPropertiesSerializer extends JsonSerializer[SensorProperties] {
    override def serialize(value: SensorProperties, jsonGenerator: JsonGenerator, serializerProvider: SerializerProvider): Unit = {
      jsonGenerator.writeRawValue(Json.toJson(value).toString())
    }
  }

  private val module = new SimpleModule()
    .addDeserializer(classOf[SensorType], new SensorTypesDeserializer)
    .addDeserializer(classOf[JobStatus], new JobStatusesDeserializer)
    .addDeserializer(classOf[JobType], new JobTypesDeserializer)
    .addDeserializer(classOf[DagInstanceStatus], new DagInstanceStatusesDeserializer)
    .addDeserializer(classOf[JobDefinitionParameters], new JobDefinitionParametersDeserializer)
    .addSerializer(classOf[JobDefinitionParameters], new JobDefinitionParametersSerializer)
    .addDeserializer(classOf[JobTemplateParameters], new JobTemplateParametersDeserializer)
    .addSerializer(classOf[JobTemplateParameters], new JobTemplateParametersSerializer)
    .addSerializer(classOf[DagInstanceStatus], new DagInstanceStatusesSerializer)
    .addDeserializer(classOf[FormConfig], new FormConfigDeserializer)
    .addSerializer(classOf[FormConfig], new FormConfigSerializer)
    .addDeserializer(classOf[SensorProperties], new SensorPropertiesDeserializer)
    .addSerializer(classOf[SensorProperties], new SensorPropertiesSerializer)

  private val objectMapper = new ObjectMapper()
    .registerModule(DefaultScalaModule)
    .registerModule(new JavaTimeModule())
    .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
    .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
    .configure(DeserializationFeature.FAIL_ON_MISSING_CREATOR_PROPERTIES, false)
    .configure(DeserializationFeature.FAIL_ON_NULL_CREATOR_PROPERTIES, true)
    .registerModule(module)

  def getObjectMapper: ObjectMapper = objectMapper
}
