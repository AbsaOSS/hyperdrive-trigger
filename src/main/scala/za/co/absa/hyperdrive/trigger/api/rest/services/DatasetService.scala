package za.co.absa.hyperdrive.trigger.api.rest.services

import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.api.rest.clients.MenasClient
import za.co.absa.hyperdrive.trigger.models.VersionedDataset

import scala.concurrent.Future

trait DatasetService {
    val menasClient: MenasClient

    def search(searchQuery: Option[String]): Future[Seq[VersionedDataset]]
}

@Service
class DatasetServiceImpl(override val menasClient: MenasClient) extends DatasetService {
  
    override def search(searchQuery: Option[String]): Future[Seq[VersionedDataset]] = 
        menasClient.listVersionedDatasets(searchQuery)
}
