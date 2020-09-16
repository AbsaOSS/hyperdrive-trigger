
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

package za.co.absa.hyperdrive.trigger.api.rest.services

import za.co.absa.hyperdrive.trigger.models.enums.JobTypes
import za.co.absa.hyperdrive.trigger.models.{JobParameters, JobTemplate}

object JobTemplateFixture {

  val GenericSparkJobTemplate: JobTemplate = {
    JobTemplate(
      name = "Generic Spark Job Template",
      jobType = JobTypes.Spark,
      jobParameters = JobParameters(Map(), Map(), Map()),
      id = 1,
      formConfig = "Spark"
    )
  }

  val GenericShellJobTemplate: JobTemplate = {
    JobTemplate(
      name = "Generic Shell Job Template",
      jobType = JobTypes.Shell,
      jobParameters = JobParameters(Map(), Map(), Map()),
      id = 2,
      formConfig = "Shell"
    )
  }
}
