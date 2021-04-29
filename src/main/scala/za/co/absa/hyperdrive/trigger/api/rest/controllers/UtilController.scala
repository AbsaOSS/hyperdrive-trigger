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

import it.burning.cron.CronExpressionParser.{CronExpressionParseException, Options}
import it.burning.cron.CronExpressionDescriptor
import org.springframework.web.bind.annotation._
import za.co.absa.hyperdrive.trigger.models.QuartzExpressionDetail

import java.util.Locale

@RestController
class UtilController {

  @GetMapping(path = Array("/util/quartzDetail"))
  def getQuartzDetail(@RequestParam expression: String): QuartzExpressionDetail = {
    try {
      val description = CronExpressionDescriptor.getDescription(expression, new Options() {{
        setLocale(Locale.UK)
        setVerbose(true)
      }})
      QuartzExpressionDetail(
        expression = expression,
        isValid = true,
        explained = description
      )
    } catch {
      case e: CronExpressionParseException => {
        QuartzExpressionDetail(
          expression = expression,
          isValid = false,
          explained = e.getMessage
        )
      }
    }
  }
}
