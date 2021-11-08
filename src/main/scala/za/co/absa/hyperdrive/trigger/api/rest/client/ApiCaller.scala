package za.co.absa.hyperdrive.trigger.api.rest.client

trait ApiCaller {
  def call[T](fn: String => T): T
}
