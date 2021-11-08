package za.co.absa.hyperdrive.trigger.configuration.application

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding
import org.springframework.boot.context.properties.bind.DefaultValue
import org.springframework.boot.context.properties.bind.Name
import org.springframework.validation.annotation.Validated

@ConfigurationProperties("menas")
@ConstructorBinding
@Validated
class MenasConfig(
  @DefaultValue(Array(""))
  val keytab: String,
  @DefaultValue(Array(""))
  val username: String,
  @DefaultValue(Array(""))
  val password: String,
  val baseUrls: Array[String],
  @DefaultValue(Array(""))
  val ldapPath: String,
  @DefaultValue(Array(""))
  val spnegoPath: String,
  retriesInternal: Integer
) {
  val retries: Option[Int] = Option[Integer](retriesInternal).map(Integer2int)
}
