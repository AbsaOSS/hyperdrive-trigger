package za.co.absa.hyperdrive.trigger.api.rest.clients

import scala.concurrent.Future
import za.co.absa.hyperdrive.trigger.models.VersionedDataset
import org.springframework.stereotype.Component

@Component
class MenasClient {
  def listVersionedDatasets(searchQuery: Option[String]): Future[Seq[VersionedDataset]] = ???
}
