package za.co.absa.hyperdrive.trigger.api.rest.client

import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule

import scala.reflect.ClassTag
import scala.util.Try

object JsonSerializer {
  val objectMapper: ObjectMapper = new ObjectMapper()
    .registerModule(DefaultScalaModule)
    .registerModule(new JavaTimeModule())
    .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
    .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)

  def fromJson[T](json: String)(implicit ct: ClassTag[T]): T = {
    val clazz = ct.runtimeClass.asInstanceOf[Class[T]]
    if (clazz == classOf[String]) {
      json.asInstanceOf[T]
    } else {
      objectMapper.readValue(json, clazz)
    }
  }

  def toJson[T](entity: T): String =
    entity match {
      case str: String =>
        if (isValidJson(str)) str else objectMapper.writeValueAsString(entity)
      case _ =>
        objectMapper.writeValueAsString(entity)
    }

  def isValidJson[T](str: T with String): Boolean =
    Try(objectMapper.readTree(str)).isSuccess
}
