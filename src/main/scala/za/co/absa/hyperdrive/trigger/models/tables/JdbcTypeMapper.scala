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

package za.co.absa.hyperdrive.trigger.models.tables

import play.api.libs.json.{JsValue, Json}
import slick.jdbc.JdbcType
import za.co.absa.hyperdrive.trigger.api.rest.ObjectMapperSingleton
import za.co.absa.hyperdrive.trigger.models.NotificationRule.Recipients
import za.co.absa.hyperdrive.trigger.models.enums.DBOperation.DBOperation
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses.DagInstanceStatus
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.JobStatus
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes.JobType
import za.co.absa.hyperdrive.trigger.models.enums.SchedulerInstanceStatuses.SchedulerInstanceStatus
import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes.SensorType
import za.co.absa.hyperdrive.trigger.models.enums._
import za.co.absa.hyperdrive.trigger.models._

import java.io.StringWriter
import scala.collection.immutable.SortedMap

trait JdbcTypeMapper {
  this: Profile =>
  import api._

  implicit lazy val workflowJoinedMapper: JdbcType[WorkflowJoined] = MappedColumnType.base[WorkflowJoined, String](
    workflowJoined => {
      val stringWriter = new StringWriter
      ObjectMapperSingleton.getObjectMapper.writeValue(stringWriter, workflowJoined)
      stringWriter.toString
    },
    workflowJoinedString => {
      ObjectMapperSingleton.getObjectMapper.readValue(workflowJoinedString, classOf[WorkflowJoined])
    }
  )

  implicit lazy val dbOperationMapper: JdbcType[DBOperation] =
    MappedColumnType.base[DBOperation, String](
      dbOperation => dbOperation.name,
      dbOperationName => DBOperation.dbOperations.find(_.name == dbOperationName).getOrElse(
        throw new Exception(s"Couldn't find DBOperation: $dbOperationName")
      )
    )

  implicit lazy val sensorTypeMapper: JdbcType[SensorType] =
    MappedColumnType.base[SensorType, String](
      sensorType => sensorType.name,
      sensorTypeName => SensorTypes.convertSensorTypeNameToSensorType(sensorTypeName)
    )

  implicit lazy val jobTypeMapper: JdbcType[JobType] =
    MappedColumnType.base[JobType, String](
      jobType => jobType.name,
      jobTypeName => JobTypes.jobTypes.find(_.name == jobTypeName).getOrElse(
        throw new Exception(s"Couldn't find JobType: $jobTypeName")
      )
    )

  implicit lazy val jobStatusMapper: JdbcType[JobStatus] =
    MappedColumnType.base[JobStatus, String](
      jobStatus => jobStatus.name,
      jobStatusName => JobStatuses.statuses.find(_.name == jobStatusName).getOrElse(
        throw new Exception(s"Couldn't find JobStatus: $jobStatusName")
      )
    )

  implicit lazy val dagInstanceStatusMapper: JdbcType[DagInstanceStatus] =
    MappedColumnType.base[DagInstanceStatus, String](
      status => status.name,
      DagInstanceStatuses.convertStatusNameToDagInstanceStatus
    )

  implicit lazy val instanceStatusMapper: JdbcType[SchedulerInstanceStatus] =
    MappedColumnType.base[SchedulerInstanceStatus, String](
      status => status.name,
      statusName => SchedulerInstanceStatuses.statuses.find(_.name == statusName).getOrElse(
        throw new Exception(s"Couldn't find SchedulerInstanceStatus: $statusName")
      )
    )

  //TEMPORARY MAPPING, SEPARATE TABLE WILL BE CREATED
  implicit lazy val mapMapper: JdbcType[Map[String, String]] =
    MappedColumnType.base[Map[String, String], String](
      parameters => Json.toJson(parameters).toString(),
      parametersEncoded => Json.parse(parametersEncoded).as[Map[String, String]]
    )

  //TEMPORARY MAPPING, SEPARATE TABLE WILL BE CREATED
  implicit lazy val mapListMapper: JdbcType[Map[String, List[String]]] =
    MappedColumnType.base[Map[String, List[String]], String](
      parameters => Json.toJson(parameters).toString(),
      parametersEncoded => Json.parse(parametersEncoded).as[Map[String, List[String]]]
    )

  implicit lazy val mapSortedMapMapper: JdbcType[Map[String, SortedMap[String, String]]] =
    MappedColumnType.base[Map[String, SortedMap[String, String]], String](
      parameters => Json.toJson(parameters).toString(),
      parametersEncoded => {
        val genericMap = Json.parse(parametersEncoded).as[Map[String, Map[String, String]]]
        genericMap.map{case (key, value) => key -> SortedMap(value.toArray:_*)}
      }
    )

  implicit lazy val jobInstanceParametersMapper: JdbcType[JobInstanceParameters] = MappedColumnType.base[JobInstanceParameters, JsValue](
    {
      case spark: SparkInstanceParameters => Json.toJson(spark)
      case shell: ShellInstanceParameters => Json.toJson(shell)
    },
    column => column.as[JobInstanceParameters]
  )

  implicit lazy val jobTemplateParametersMapper: JdbcType[JobTemplateParameters] = MappedColumnType.base[JobTemplateParameters, JsValue](
    {
      case spark: SparkTemplateParameters => Json.toJson(spark)
      case shell: ShellTemplateParameters => Json.toJson(shell)
    },
    column => column.as[JobTemplateParameters]
  )

  implicit lazy val jobDefinitionParametersMapper: JdbcType[JobDefinitionParameters] = MappedColumnType.base[JobDefinitionParameters, JsValue](
    {
      case spark: SparkDefinitionParameters => Json.toJson(spark)
      case hyperdrive: HyperdriveDefinitionParameters => Json.toJson(hyperdrive)
      case shell: ShellDefinitionParameters => Json.toJson(shell)
    },
    column => column.as[JobDefinitionParameters]
  )

  implicit lazy val notificationRuleMapper: JdbcType[NotificationRule] = MappedColumnType.base[NotificationRule, JsValue](
    notificationRule => Json.toJson(notificationRule),
    column => column.as[NotificationRule]
  )

  implicit lazy val recipientsMapper: JdbcType[Recipients] = MappedColumnType.base[Recipients, JsValue](
    recipients => Json.toJson(recipients.sorted),
    column => column.as[Recipients]
  )

  implicit lazy val sensorPropertiesMapper: JdbcType[SensorProperties] = MappedColumnType.base[SensorProperties, JsValue](
    {
      case kafka: KafkaSensorProperties => Json.toJson(kafka)
      case absaKafka: AbsaKafkaSensorProperties => Json.toJson(absaKafka)
      case recurring: RecurringSensorProperties => Json.toJson(recurring)
      case time: TimeSensorProperties => Json.toJson(time)
    },
    column => column.as[SensorProperties]
  )

}
