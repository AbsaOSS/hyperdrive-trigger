package za.co.absa.hyperdrive.trigger.models.tables.tableExtensions.optimisticLocking

import slick.lifted.Rep

trait OptimisticLockingTable {
  def version: Rep[Long]
}
