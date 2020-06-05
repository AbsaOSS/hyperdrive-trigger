
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
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.http.{HttpStatus, ResponseEntity}
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

  @ExceptionHandler(Array(classOf[HttpMessageNotReadableException]))
  def handleMethodArgumentNotValidException(ex: HttpMessageNotReadableException, request: WebRequest): ResponseEntity[Object] = {
    logger.error("Probably Jackson Deserialization failed", ex)
    new ResponseEntity(HttpStatus.BAD_REQUEST)
  }

  @ExceptionHandler
  def handleThrowable(ex: Throwable): ResponseEntity[Object] = {
    logger.error("Unexpected error occurred", ex)
    new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
  }
}
