package za.co.absa.hyperdrive.trigger.api.rest.services

import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.api.rest.client.MenasClient
import za.co.absa.hyperdrive.trigger.models.VersionedDataset

import javax.inject.Inject
import scala.concurrent.ExecutionContext
import scala.concurrent.Future

trait DatasetService {
  val menasClient: MenasClient

  def search(searchQuery: Option[String])(implicit ec: ExecutionContext): Future[Seq[VersionedDataset]]
}

@Service
class DatasetServiceImpl @Inject() (override val menasClient: MenasClient) extends DatasetService {

  override def search(searchQuery: Option[String])(implicit ec: ExecutionContext): Future[Seq[VersionedDataset]] =
    menasClient.listVersionedDatasets(searchQuery)
}
