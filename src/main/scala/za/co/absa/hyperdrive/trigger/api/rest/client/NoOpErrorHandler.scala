package za.co.absa.hyperdrive.trigger.api.rest.client

import org.springframework.http.client.ClientHttpResponse
import org.springframework.web.client.ResponseErrorHandler

object NoOpErrorHandler extends ResponseErrorHandler {
  override def hasError(response: ClientHttpResponse): Boolean = false

  override def handleError(response: ClientHttpResponse): Unit = {}
}
