package za.co.absa.hyperdrive.trigger.api.rest.client

import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter
import org.springframework.web.client.RestTemplate

import scala.collection.JavaConverters._

object RestTemplateSingleton {
  val instance: RestTemplate = {
    val template = new RestTemplate()
    // Need to replace the default Jackson converter with one using a Scala serializer
    val converters = template.getMessageConverters.asScala.map {
      case _: MappingJackson2HttpMessageConverter =>
        new MappingJackson2HttpMessageConverter(JsonSerializer.objectMapper)
      case converter => converter
    }.asJava
    template.setMessageConverters(converters)
    template.setErrorHandler(NoOpErrorHandler)
    template
  }
}
