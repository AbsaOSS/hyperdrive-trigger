package za.co.absa.hyperdrive.trigger.api.rest.client
//FIXME: protected?
trait ApiCaller {
  def call[T](fn: String => T): T
}
