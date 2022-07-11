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

-- Convert job_definition's additionalSparkConfig from map into array
update job_definition
set job_parameters = jsonb_set(
    job_definition.job_parameters::jsonb,
    array ['additionalSparkConfig'],
    updated_additional_spark_config.additional_spark_config,
    true
)
from (
      select job_definition_for_join.id, coalesce(aggregated_additional_spark_config.additional_spark_config::jsonb, '[]'::jsonb) as additional_spark_config
      from (
            select flattened_additional_spark_config.id, jsonb_agg(flattened_additional_spark_config.additional_spark_config)::jsonb as additional_spark_config
            from (
                  select id, jsonb_each_text(job_definition.job_parameters::jsonb -> 'additionalSparkConfig') as additional_spark_config
                  from job_definition
            ) as flattened_additional_spark_config
             group by flattened_additional_spark_config.id
      ) as aggregated_additional_spark_config
      right join job_definition as job_definition_for_join
      on job_definition_for_join.id = aggregated_additional_spark_config.id
) as updated_additional_spark_config
where updated_additional_spark_config.id = job_definition.id;

-- Convert job_instance's additionalSparkConfig from map into array
update job_instance
set job_parameters = jsonb_set(
    job_instance.job_parameters::jsonb,
    array ['additionalSparkConfig'],
    updated_additional_spark_config.additional_spark_config,
    true
)
from (
      select job_instance_for_join.id, coalesce(aggregated_additional_spark_config.additional_spark_config::jsonb, '[]'::jsonb) as additional_spark_config
      from (
            select flattened_additional_spark_config.id, jsonb_agg(flattened_additional_spark_config.additional_spark_config)::jsonb as additional_spark_config
            from (
                  select id, jsonb_each_text(job_instance.job_parameters::jsonb -> 'additionalSparkConfig') as additional_spark_config
                  from job_instance
            ) as flattened_additional_spark_config
            group by flattened_additional_spark_config.id
      ) as aggregated_additional_spark_config
      right join job_instance as job_instance_for_join
      on job_instance_for_join.id = aggregated_additional_spark_config.id
) as updated_additional_spark_config
where updated_additional_spark_config.id = job_instance.id;

-- Convert job_template's additionalSparkConfig from map into array
update job_template
set job_parameters = jsonb_set(
    job_template.job_parameters::jsonb,
    array ['additionalSparkConfig'],
    (updated_additional_spark_config.additional_spark_config),
    true
)
from (
      select job_template_for_join.id, coalesce(aggregated_additional_spark_config.additional_spark_config::jsonb, '[]'::jsonb) as additional_spark_config
      from (
            select flattened_additional_spark_config.id, jsonb_agg(flattened_additional_spark_config.additional_spark_config)::jsonb as additional_spark_config
            from (
                  select id, jsonb_each_text(job_template.job_parameters::jsonb -> 'additionalSparkConfig') as additional_spark_config
                  from job_template
            ) as flattened_additional_spark_config
            group by flattened_additional_spark_config.id
      ) as aggregated_additional_spark_config
      right join job_template as job_template_for_join
      on job_template_for_join.id = aggregated_additional_spark_config.id
) as updated_additional_spark_config
where updated_additional_spark_config.id = job_template.id;

-- Convert job_template_history's additionalSparkConfig from map into array
update job_template_history
set job_template = jsonb_set(
    job_template_history.job_template::jsonb,
    array ['jobParameters','additionalSparkConfig'],
    (updated_additional_spark_config.additional_spark_config),
    true
)
from (
      select job_template_history_for_join.id, coalesce(aggregated_additional_spark_config.additional_spark_config::jsonb, '[]'::jsonb) as additional_spark_config
      from (
            select flattened_additional_spark_config.id, jsonb_agg(flattened_additional_spark_config.additional_spark_config)::jsonb as additional_spark_config
            from (
                  select id, jsonb_each_text(job_template_history.job_template::jsonb -> 'jobParameters' -> 'additionalSparkConfig') as additional_spark_config
                  from job_template_history
            ) as flattened_additional_spark_config
            group by flattened_additional_spark_config.id
      ) as aggregated_additional_spark_config
      right join job_template_history as job_template_history_for_join
      on job_template_history_for_join.id = aggregated_additional_spark_config.id
) as updated_additional_spark_config
where updated_additional_spark_config.id = job_template_history.id;

-- Convert workflow_history's additionalSparkConfig from map into array
with flattened_job_definitions as (
    select id, jsonb_array_elements(workflow::jsonb -> 'dagDefinitionJoined' -> 'jobDefinitions') as job_definition
    from workflow_history
),
flattened_job_definitions_with_ids as (
    select flattened_job_definitions.id, flattened_job_definitions.job_definition::jsonb -> 'id' as job_id, flattened_job_definitions.job_definition as job_definition
    from flattened_job_definitions
),
updated_additional_spark_config as (
    select flattened_job_definitions_with_ids_for_join.id, flattened_job_definitions_with_ids_for_join.job_id, coalesce(aggregated_additional_spark_config.additional_spark_config::jsonb, '[]'::jsonb) as additional_spark_config
    from (
          select flattened_additional_spark_config.id, job_id, jsonb_agg(flattened_additional_spark_config.additional_spark_config)::jsonb as additional_spark_config
          from (
                select id, job_id, jsonb_each_text(job_definition::jsonb -> 'jobParameters' -> 'additionalSparkConfig') as additional_spark_config
                from flattened_job_definitions_with_ids
          ) as flattened_additional_spark_config
          group by flattened_additional_spark_config.id, job_id
    ) as aggregated_additional_spark_config
    right join flattened_job_definitions_with_ids as flattened_job_definitions_with_ids_for_join
    on flattened_job_definitions_with_ids_for_join.id = aggregated_additional_spark_config.id
        AND flattened_job_definitions_with_ids_for_join.job_id = aggregated_additional_spark_config.job_id
),
updated_job_definitons as (
    select flattened_job_definitions_with_ids.id as id, flattened_job_definitions_with_ids.job_id,
        jsonb_set(
            flattened_job_definitions_with_ids.job_definition::jsonb,
            array ['jobParameters','additionalSparkConfig'],
            (updated_additional_spark_config.additional_spark_config),
            true
        ) as job_definitions
    from flattened_job_definitions_with_ids, updated_additional_spark_config
    where flattened_job_definitions_with_ids.id = updated_additional_spark_config.id AND flattened_job_definitions_with_ids.job_id = updated_additional_spark_config.job_id
),
aggregated_job_definitions as (
    select updated_job_definitons.id, jsonb_agg(updated_job_definitons.job_definitions) as job_definitions
    from updated_job_definitons
    group by updated_job_definitons.id
)
update workflow_history
set workflow = jsonb_set(workflow::jsonb, array['dagDefinitionJoined', 'jobDefinitions'], aggregated_job_definitions.job_definitions)
from aggregated_job_definitions
where aggregated_job_definitions.id=workflow_history.id;
