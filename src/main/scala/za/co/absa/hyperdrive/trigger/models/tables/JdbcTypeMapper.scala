package za.co.absa.hyperdrive.trigger.models.tables

import za.co.absa.hyperdrive.trigger.models.enums.{SensorTypes, JobStatuses, JobTypes}
import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes.SensorType
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.JobStatus
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes.JobType
import play.api.libs.json.{JsValue, Json}
import slick.jdbc.JdbcType
import scala.util.Try
import za.co.absa.hyperdrive.trigger.models.tables.JDBCProfile.profile._

object JdbcTypeMapper {

  implicit val sensorTypeMapper: JdbcType[SensorType] =
    MappedColumnType.base[SensorType, String](
      sensorType => sensorType.name,
      sensorTypeName => SensorTypes.sensorTypes.find(_.name == sensorTypeName).getOrElse(
        throw new Exception(s"Couldn't find SensorType: $sensorTypeName")
      )
    )

  implicit val jobTypeMapper: JdbcType[JobType] =
    MappedColumnType.base[JobType, String](
      jobType => jobType.name,
      jobTypeName => JobTypes.jobTypes.find(_.name == jobTypeName).getOrElse(
        throw new Exception(s"Couldn't find JobType: $jobTypeName")
      )
    )

  implicit val statusMapper: JdbcType[JobStatus] =
    MappedColumnType.base[JobStatus, String](
      jobStatus => jobStatus.name,
      jobStatusName => JobStatuses.statuses.find(_.name == jobStatusName).getOrElse(
        throw new Exception(s"Couldn't find JobStatus: $jobStatusName")
      )
    )

  implicit val payloadMapper: JdbcType[JsValue] =
    MappedColumnType.base[JsValue, String](
      payload => payload.toString(),
      payloadString => Try(Json.parse(payloadString)).getOrElse(
        throw new Exception(s"Couldn't parse payload: $payloadString")
      )
    )

  //TEMPORARY MAPPING, SEPARATE TABLE WILL BE CREATED
  implicit val mapMapper: JdbcType[Map[String, String]] =
    MappedColumnType.base[Map[String, String], String](
      parameters => Json.toJson(parameters).toString(),
      parametersEncoded => Json.parse(parametersEncoded).as[Map[String, String]]
    )

  //TEMPORARY MAPPING, SEPARATE TABLE WILL BE CREATED
  implicit val mapSetMapper: JdbcType[Map[String, Set[String]]] =
    MappedColumnType.base[Map[String, Set[String]], String](
      parameters => Json.toJson(parameters).toString(),
      parametersEncoded => Json.parse(parametersEncoded).as[Map[String, Set[String]]]
    )

}
