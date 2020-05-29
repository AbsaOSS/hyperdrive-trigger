
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

package za.co.absa.hyperdrive.trigger.api.rest.controllers

import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR
import org.springframework.http.{HttpStatus, ResponseEntity}
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.{ExceptionHandler, RestControllerAdvice}
import org.springframework.web.context.request.WebRequest
import za.co.absa.hyperdrive.trigger.models.errors.ApiException

@RestControllerAdvice
class RestErrorHandler {
  private val logger = LoggerFactory.getLogger(this.getClass)

  @ExceptionHandler(Array(classOf[ApiException]))
  def handleApiException(ex: ApiException, request: WebRequest): ResponseEntity[Object] = {
    logger.error("ApiException occurred", ex)
    new ResponseEntity(ex.apiErrors, HttpStatus.UNPROCESSABLE_ENTITY)
  }

  /**
   * Handles exceptions caused by violations against JSR-380 bean validations
   */
  @ExceptionHandler(Array(classOf[MethodArgumentNotValidException]))
  def handleMethodArgumentNotValidException(ex: MethodArgumentNotValidException, request: WebRequest): ResponseEntity[Object] = {
    logger.error("Bean validation failed", ex)
    import collection.JavaConverters._
    val errorMessages = ex.getBindingResult.getFieldErrors().asScala
      .map(fieldError => fieldError.getField -> fieldError.getDefaultMessage)
    new ResponseEntity(errorMessages, HttpStatus.BAD_REQUEST)
  }

  @ExceptionHandler
  def handleThrowable(ex: Throwable): ResponseEntity[Object] = {
    logger.error("Unexpected error occurred", ex)
    new ResponseEntity(INTERNAL_SERVER_ERROR)
  }
}