package za.co.absa.hyperdrive.trigger.api.rest.client

abstract class RetryableException(message: String, cause: Throwable) extends Exception(message, cause)

final case class ApiClientException(private val message: String, private val cause: Throwable = None.orNull)
    extends RetryableException(message, cause)

final case class UnauthorizedException(private val message: String, private val cause: Throwable = None.orNull)
    extends Exception(message, cause)

final case class NotFoundException(private val message: String, private val cause: Throwable = None.orNull)
    extends Exception(message, cause)
