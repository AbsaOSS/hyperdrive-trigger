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

import java.io.File
import java.nio.file.{Files, Paths}

import javax.inject.Inject
import org.springframework.boot.actuate.endpoint.web.annotation.RestControllerEndpoint
import org.springframework.core.env.Environment
import org.springframework.core.io.ByteArrayResource
import org.springframework.http.{HttpHeaders, HttpStatus, MediaType, ResponseEntity}
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.{GetMapping, RequestParam}

@Component
@RestControllerEndpoint(id = "logfiles")
class ManagementCustomEndpoint {

  @Inject
  val env: Environment = null

  @GetMapping(path = Array("/"))
  def getLogArchives: ResponseEntity[Seq[String]] = {
    val logsDir = new File(env.getProperty("logging.path"))
    val result = if(logsDir.exists && logsDir.isDirectory) {
      logsDir.listFiles.filter {
        e => e.isFile && e.getName.endsWith(".gz")
      }.map(_.getName)
    } else {
      Array[String]()
    }
    new ResponseEntity(result, HttpStatus.OK)
  }

  @GetMapping(path = Array("/download"))
  def downloadLogArchive(@RequestParam fileName: String): ResponseEntity[ByteArrayResource] = {
    val logFile = new File(s"${env.getProperty("logging.path")}/$fileName")
    val header = new HttpHeaders()
    header.add(HttpHeaders.CONTENT_DISPOSITION, s"attachment; filename=$fileName")
    header.add("Cache-Control", "no-cache, no-store, must-revalidate")
    header.add("Pragma", "no-cache")
    header.add("Expires", "0")

    val logFilePath = Paths.get(logFile.getAbsolutePath)
    val resource = new ByteArrayResource(Files.readAllBytes(logFilePath))

    ResponseEntity.ok()
      .headers(header)
      .contentLength(logFile.length())
      .contentType(MediaType.parseMediaType("application/octet-stream"))
      .body(resource)
  }
}
