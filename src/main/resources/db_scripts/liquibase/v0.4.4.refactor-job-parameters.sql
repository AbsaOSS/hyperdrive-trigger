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

alter table job_definition alter column variables drop not null;
alter table job_definition alter column variables set default '{}';
alter table job_definition alter column maps drop not null;
alter table job_definition alter column maps set default '{}';
alter table job_definition alter column key_value_pairs drop not null;
alter table job_definition alter column key_value_pairs set default '{}';

alter table job_definition add job_parameters jsonb not null default '{}';
update job_definition
set job_parameters = variables::jsonb || maps::jsonb || key_value_pairs::jsonb;

alter table job_definition rename column variables to variables_old;
alter table job_definition rename column maps to maps_old;
alter table job_definition rename column key_value_pairs to key_value_pairs_old;

UPDATE job_definition jd
SET job_parameters = jd.job_parameters::jsonb || ('{"formConfig":"' || jt.form_config || '"}')::jsonb
FROM job_template jt
WHERE jd.job_template_id = jt.id;







alter table job_template alter column variables drop not null;
alter table job_template alter column variables set default '{}';
alter table job_template alter column maps drop not null;
alter table job_template alter column maps set default '{}';
alter table job_template alter column key_value_pairs drop not null;
alter table job_template alter column key_value_pairs set default '{}';

alter table job_template add job_parameters jsonb not null default '{}';
update job_template
set job_parameters = variables::jsonb || maps::jsonb || key_value_pairs::jsonb;

alter table job_template rename column variables to variables_old;
alter table job_template rename column maps to maps_old;
alter table job_template rename column key_value_pairs to key_value_pairs_old;

update job_template
set job_parameters = job_parameters::jsonb || ('{"jobType":"' || job_type || '"}' )::jsonb;

alter table job_template rename column job_type to job_type_old;
alter table job_template alter column job_type_old drop not null;

update workflow_history
set workflow = jsonb_set(workflow::jsonb, array['dagDefinitionJoined', 'jobDefinitions'], updated.updatedJobDefinitions)
    from (
  select
    historyId,
    jsonb_agg(
      case
        when (toUpdateWithFormConfig.jobDefinition -> 'jobParameters' ?? 'maps' OR
             toUpdateWithFormConfig.jobDefinition -> 'jobParameters' ?? 'variables' OR
             toUpdateWithFormConfig.jobDefinition -> 'jobParameters' ?? 'keyValuePairs')
        then jsonb_set(
                toUpdateWithFormConfig.jobDefinition::jsonb,
                array ['jobParameters'],
                (toUpdateWithFormConfig.jobDefinition::jsonb -> 'jobParameters' -> 'maps')::jsonb ||
                (toUpdateWithFormConfig.jobDefinition::jsonb -> 'jobParameters' -> 'variables')::jsonb ||
                (toUpdateWithFormConfig.jobDefinition::jsonb -> 'jobParameters' -> 'keyValuePairs')::jsonb ||
                ('{"formConfig":' || toUpdateWithFormConfig.formConfigName || '}')::jsonb,
                true
             )
        else toUpdateWithFormConfig.jobDefinition::jsonb
      end
    ) as updatedJobDefinitions
  from (
    select
      toUpdate.historyId,
      toUpdate.jobDefinition,
      case
        when toUpdate.jobTypeName::varchar is not null
        then toUpdate.jobTypeName::varchar
        when jobTemplate.form_config::varchar  is not null
        then concat('"', jobTemplate.form_config::varchar,'"')
        else '"Unknown"'::varchar
      end as formConfigName
    from (
      select
        id as historyId,
        jsonb_array_elements(workflow::jsonb -> 'dagDefinitionJoined' -> 'jobDefinitions')  as jobDefinition,
        jsonb_array_elements(workflow::jsonb -> 'dagDefinitionJoined' -> 'jobDefinitions') -> 'jobType' -> 'name' as jobTypeName,
        jsonb_array_elements(workflow::jsonb -> 'dagDefinitionJoined' -> 'jobDefinitions') -> 'jobTemplateId' as templateId
      from workflow_history
    ) as toUpdate
    left outer join job_template as jobTemplate
    on toUpdate.templateId::bigint = jobTemplate.id
  ) as toUpdateWithFormConfig
  group by toUpdateWithFormConfig.historyId
) as updated
where updated.historyId=workflow_history.id;