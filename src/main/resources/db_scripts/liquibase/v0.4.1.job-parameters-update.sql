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

-- JOB DEFINITION
ALTER TABLE job_definition ALTER COLUMN variables DROP NOT NULL;
ALTER TABLE job_definition ALTER COLUMN variables SET DEFAULT '{}';
ALTER TABLE job_definition ALTER COLUMN maps DROP NOT NULL;
ALTER TABLE job_definition ALTER COLUMN maps SET DEFAULT '{}';
ALTER TABLE job_definition ALTER COLUMN key_value_pairs DROP NOT NULL;
ALTER TABLE job_definition ALTER COLUMN key_value_pairs SET DEFAULT '{}';


alter table job_definition
    add job_parameters jsonb NOT NULL DEFAULT '{}';
update job_definition
set job_parameters = variables::jsonb || maps::jsonb || key_value_pairs::jsonb;


-- JOB INSTANCE
ALTER TABLE job_instance ALTER COLUMN variables DROP NOT NULL;
ALTER TABLE job_instance ALTER COLUMN variables SET DEFAULT '{}';
ALTER TABLE job_instance ALTER COLUMN maps DROP NOT NULL;
ALTER TABLE job_instance ALTER COLUMN maps SET DEFAULT '{}';
ALTER TABLE job_instance ALTER COLUMN key_value_pairs DROP NOT NULL;
ALTER TABLE job_instance ALTER COLUMN key_value_pairs SET DEFAULT '{}';


alter table job_instance
    add job_parameters jsonb NOT NULL DEFAULT '{}';
update job_instance
set job_parameters = variables::jsonb || maps::jsonb || key_value_pairs::jsonb;

-- JOB TEMPLATE
ALTER TABLE job_template ALTER COLUMN variables DROP NOT NULL;
ALTER TABLE job_template ALTER COLUMN variables SET DEFAULT '{}';
ALTER TABLE job_template ALTER COLUMN maps DROP NOT NULL;
ALTER TABLE job_template ALTER COLUMN maps SET DEFAULT '{}';
ALTER TABLE job_template ALTER COLUMN key_value_pairs DROP NOT NULL;
ALTER TABLE job_template ALTER COLUMN key_value_pairs SET DEFAULT '{}';


alter table job_template
    add job_parameters jsonb NOT NULL DEFAULT '{}';
update job_template
set job_parameters = variables::jsonb || maps::jsonb || key_value_pairs::jsonb;


-- WORKFLOW HISTORY
ALTER TABLE workflow_history ALTER COLUMN workflow TYPE jsonb USING workflow::jsonb;

UPDATE workflow_history
SET workflow=updatedWorkflowWithId.updatedWorkflow
FROM (SELECT workflow_history.id, jsonb_set(workflow_history.workflow, '{dagDefinitionJoined,jobDefinitions}', updatedJobPrametersWithId.updatedJobParameters, true) as updatedWorkflow
      FROM (SELECT history.id, jsonb_agg(jsonb_set(
              history.jobDefinitions,
              '{jobParameters}',
              (history.jobDefinitions -> 'jobParameters' -> 'maps')::jsonb ||
              (history.jobDefinitions -> 'jobParameters' -> 'variables')::jsonb ||
              (history.jobDefinitions -> 'jobParameters' -> 'keyValuePairs')::jsonb,
              true
          )) as updatedJobParameters
            FROM (
                     SELECT id, workflow, jsonb_array_elements(workflow -> 'dagDefinitionJoined' -> 'jobDefinitions')::jsonb as jobDefinitions
                     FROM workflow_history
                 ) as history
            GROUP BY history.id) as updatedJobPrametersWithId, workflow_history
      WHERE workflow_history.id = updatedJobPrametersWithId.id) AS updatedWorkflowWithId
WHERE workflow_history.id=updatedWorkflowWithId.id;
