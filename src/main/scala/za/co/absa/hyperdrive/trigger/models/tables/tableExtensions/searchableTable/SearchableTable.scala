package za.co.absa.hyperdrive.trigger.models.tables.tableExtensions.searchableTable

import slick.lifted.Rep

trait SearchableTable {

  def fieldMapping: Map[String, Rep[_]]

  def defaultSortColumn: Rep[_]

}
