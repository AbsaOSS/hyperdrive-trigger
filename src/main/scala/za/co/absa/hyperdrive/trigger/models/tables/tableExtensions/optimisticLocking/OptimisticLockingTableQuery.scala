package za.co.absa.hyperdrive.trigger.models.tables.tableExtensions.optimisticLocking

import org.springframework.dao.OptimisticLockingFailureException
import slick.lifted.AbstractTable
import za.co.absa.hyperdrive.trigger.models.tables.{JdbcTypeMapper, Profile}

import scala.concurrent.ExecutionContext
import scala.language.higherKinds

trait OptimisticLockingTableQuery {
  this: Profile with JdbcTypeMapper =>

  import api._

  implicit class OptimisticLockTableQueryExtension[T <: OptimisticLockingTable with AbstractTable[_]](tableQuery: TableQuery[T]) {

    def updateWithOptimisticLocking(value: T#TableElementType, version: Long)(implicit ec: ExecutionContext): DBIOAction[Int, NoStream, Effect.Write] = {
      tableQuery.subquery.updateWithOptimisticLocking(value, version)
    }
  }

  implicit class OptimisticLockQueryExtension[E <: OptimisticLockingTable with AbstractTable[_], U, C[_]](query: Query[E, U, C]) {
    def updateWithOptimisticLocking(value: U, version: Long)(implicit ec: ExecutionContext): DBIOAction[Int, NoStream, Effect.Write] = {
      query.filter(_.version === version).update(value).map { result =>
        if (result == 0) {
          throw new OptimisticLockingException
        } else {
          result
        }
      }
    }
  }
}
