package za.co.absa.hyperdrive.trigger.models

import java.nio.file.Paths

import play.api.libs.json.{Format, JsResult, JsValue, Json, OFormat}
import za.co.absa.hyperdrive.trigger.scheduler.utilities.{ShellExecutorConfig, SparkExecutorConfig}

import scala.util.Try

sealed trait JobInstanceJobParameters

case class SparkParameters(
  jobJar: String,
  mainClass: String,
  deploymentMode: String,
  appArguments: List[String] = List.empty[String],
  additionalJars: List[String] = List.empty[String],
  additionalFiles: List[String] = List.empty[String],
  additionalSparkConfig: Map[String, String] = Map.empty[String, String]
) extends JobInstanceJobParameters

case class ShellParameters(
  scriptLocation: String
) extends JobInstanceJobParameters

object SparkParameters {
  implicit val sparkFormat: OFormat[SparkParameters] = Json.using[Json.WithDefaultValues].format[SparkParameters]

  def apply(jobParameters: JobParameters): SparkParameters = {
    SparkParameters(
      jobJar = Paths.get(SparkExecutorConfig.getExecutablesFolder, jobParameters.variables("jobJar")).toString,
      mainClass = jobParameters.variables("mainClass"),
      deploymentMode = jobParameters.variables("deploymentMode"),
      appArguments = Try(jobParameters.maps("appArguments")).getOrElse(List.empty[String]),
      additionalJars = Try(jobParameters.maps("additionalJars")).getOrElse(List.empty[String]).map(jar => Paths.get(SparkExecutorConfig.getExecutablesFolder, jar).toString),
      additionalFiles = Try(jobParameters.maps("additionalFiles")).getOrElse(List.empty[String]).map(file => Paths.get(SparkExecutorConfig.getExecutablesFolder, file).toString),
      additionalSparkConfig = Try(jobParameters.keyValuePairs("additionalSparkConfig")).getOrElse(Map.empty[String, String])
    )
  }
}

object ShellParameters {
  implicit val shellFormat: OFormat[ShellParameters] = Json.using[Json.WithDefaultValues].format[ShellParameters]

  def apply(jobParameters: JobParameters): ShellParameters = new ShellParameters(
    scriptLocation = Paths.get(ShellExecutorConfig.getExecutablesFolder, jobParameters.variables("scriptLocation")).toString
  )
}

object JobInstanceJobParameters {
  implicit val jobParametersFormat: Format[JobInstanceJobParameters] = new Format[JobInstanceJobParameters] {
    override def writes(o: JobInstanceJobParameters): JsValue = o match {
      case spark: SparkParameters => Json.toJson(spark)
      case shell: ShellParameters => Json.toJson(shell)
    }
    override def reads(json: JsValue): JsResult[JobInstanceJobParameters] =
      SparkParameters.sparkFormat.reads(json).orElse(
        ShellParameters.shellFormat.reads(json))
  }
}
