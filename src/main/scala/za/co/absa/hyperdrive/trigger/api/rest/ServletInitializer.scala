package za.co.absa.hyperdrive.trigger.api.rest

import org.springframework.boot.builder.SpringApplicationBuilder
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer

class ServletInitializer extends SpringBootServletInitializer {
  
  override def configure(application: SpringApplicationBuilder): SpringApplicationBuilder = application.sources(classOf[Application])
  
}
