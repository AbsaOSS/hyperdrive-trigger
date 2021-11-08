package za.co.absa.hyperdrive.trigger.api.rest.client

import za.co.absa.hyperdrive.trigger.models.VersionedDataset

import scala.concurrent.ExecutionContext
import scala.concurrent.Future

class MenasClient(private[client] val apiCaller: ApiCaller, private[client] val restClient: RestClient) {

  def authenticate(): Unit =
    restClient.authenticate()

  def listVersionedDatasets(searchQuery: Option[String])(implicit ec: ExecutionContext): Future[Seq[VersionedDataset]] =
    Future(apiCaller.call { apiBaseUrl =>
      val queryParam = searchQuery.fold("")(query => s"?searchQuery=$query")
      val url        = s"$apiBaseUrl/menas/api/dataset/list$queryParam"
      restClient.sendGet[Seq[VersionedDataset]](url)
    })
}
