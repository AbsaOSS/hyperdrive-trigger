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

update job_template
set job_parameters = job_parameters::jsonb || ('{"jobType":"' || form_config || '"}')::jsonb;

alter table job_template alter column form_config drop not null;
alter table job_template alter column form_config set default 'NotUsed';
alter table job_template rename column form_config to form_config_old;

update job_definition
set job_parameters = job_parameters - 'formConfig' || jsonb_build_object('jobType', job_parameters->'formConfig');

alter table job_definition alter column job_template_id drop not null;

update job_definition set job_template_id = NULL
where
    ((job_parameters::jsonb ->> 'jobType' = 'Shell') AND (job_parameters::jsonb ->> 'scriptLocation' IS NOT NULL)) OR
    ((job_parameters::jsonb ->> 'jobType' = 'Hyperdrive') AND (job_parameters::jsonb ->> 'jobJar' IS NOT NULL)) OR
    ((job_parameters::jsonb ->> 'jobType' = 'Spark') AND (job_parameters::jsonb ->> 'jobJar' IS NOT NULL));

delete from job_template
where name = 'Generic Spark Job' OR name = 'Generic Shell Job';