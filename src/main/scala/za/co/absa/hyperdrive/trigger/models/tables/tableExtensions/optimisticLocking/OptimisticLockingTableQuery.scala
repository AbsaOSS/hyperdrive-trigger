/*
 * Copyright 2018 ABSA Group Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package za.co.absa.hyperdrive.trigger.models.tables.tableExtensions.optimisticLocking

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
