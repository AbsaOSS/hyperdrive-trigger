package za.co.absa.hyperdrive.trigger.persistance

import org.slf4j.LoggerFactory
import slick.dbio.{DBIOAction, Effect, NoStream}
import za.co.absa.hyperdrive.trigger.models.errors.{ApiException, GenericDatabaseError}
import za.co.absa.hyperdrive.trigger.models.tables.Profile

import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success}

private[persistance] trait DBErrorHandling {
  this: Profile =>

  private val repositoryLogger = LoggerFactory.getLogger(this.getClass)

  protected implicit class DBIOActionOps[T](val action: api.DBIO[T]) {
    def withErrorHandling(errorMessage: String)(implicit ec: ExecutionContext): DBIOAction[T, NoStream, Effect.All] = {
      action.asTry.map {
        case Success(value) => value
        case Failure(ex: ApiException) => throw ex
        case Failure(ex) =>
          repositoryLogger.error(errorMessage, ex)
          throw new ApiException(GenericDatabaseError)
      }
    }

    def withErrorHandling()(implicit ec: ExecutionContext): DBIOAction[T, NoStream, Effect.All] =
      this.withErrorHandling("Unexpected database error occurred")
  }
}
