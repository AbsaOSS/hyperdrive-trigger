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

update job_definition
set job_parameters = jsonb_set(
        job_definition.job_parameters::jsonb,
        array ['additionalSparkConfig'],
        updated_job_parameters.xxx::jsonb,
        true
    )
    from (
         select json_build_array(jsonb_each_text(job_definition.job_parameters::jsonb -> 'additionalSparkConfig'))::jsonb as xxx
         FROM job_definition
     ) as updated_job_parameters;

update job_instance
set job_parameters = jsonb_set(
        job_instance.job_parameters::jsonb,
        array ['additionalSparkConfig'],
        updated_job_parameters.xxx::jsonb,
        true
    )
    from (
         select json_build_array(jsonb_each_text(job_instance.job_parameters::jsonb -> 'additionalSparkConfig'))::jsonb as xxx
         FROM job_instance
     ) as updated_job_parameters;

update job_template
set job_parameters = jsonb_set(
        job_template.job_parameters::jsonb,
        array ['additionalSparkConfig'],
        updated_job_parameters.xxx::jsonb,
        true
    )
    from (
         select json_build_array(jsonb_each_text(job_template.job_parameters::jsonb -> 'additionalSparkConfig'))::jsonb as xxx
         FROM job_template
     ) as updated_job_parameters;
