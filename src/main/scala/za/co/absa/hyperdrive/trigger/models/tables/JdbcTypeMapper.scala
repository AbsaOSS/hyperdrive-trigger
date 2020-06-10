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

import za.co.absa.hyperdrive.trigger.models.enums.{DagInstanceStatuses, JobStatuses, JobTypes, SensorTypes}
import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes.SensorType
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.JobStatus
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes.JobType
import play.api.libs.json.{JsValue, Json}
import slick.jdbc.JdbcType
import za.co.absa.hyperdrive.trigger.models.enums.DagInstanceStatuses.DagInstanceStatus

import scala.util.Try

trait JdbcTypeMapper {
  this: Profile =>
  import profile.api._

  implicit lazy val sensorTypeMapper: JdbcType[SensorType] =
    MappedColumnType.base[SensorType, String](
      sensorType => sensorType.name,
      sensorTypeName => SensorTypes.sensorTypes.find(_.name == sensorTypeName).getOrElse(
        throw new Exception(s"Couldn't find SensorType: $sensorTypeName")
      )
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
      statusName => DagInstanceStatuses.statuses.find(_.name == statusName).getOrElse(
        throw new Exception(s"Couldn't find DagInstanceStatus: $statusName")
      )
    )

  implicit lazy val payloadMapper: JdbcType[JsValue] =
    MappedColumnType.base[JsValue, String](
      payload => payload.toString(),
      payloadString => Try(Json.parse(payloadString)).getOrElse(
        throw new Exception(s"Couldn't parse payload: $payloadString")
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

}
