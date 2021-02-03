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

-- copy of db_scripts/delta_script_v0_to_v1.sql

alter table "dag_instance"
add "started" TIMESTAMP NOT NULL DEFAULT NOW();

alter table "dag_instance"
add "finished" TIMESTAMP;

update dag_instance
set "finished" = (
    select MAX(job_instance.updated)
    from job_instance
    where dag_instance.id = job_instance.dag_instance_id
);

update dag_instance
set "started" = (
    select MIN(job_instance.created)
    from job_instance
    where dag_instance.id = job_instance.dag_instance_id
);

create view "dag_run_view" AS
select
    dag_instance.id as "id",
    workflow.name as "workflow_name",
    workflow.project as "project_name",
    COALESCE(jobInstanceCount.count, 0) as "job_count",
    dag_instance.started as "started",
    dag_instance.finished as "finished",
    dag_instance.status as "status"
from dag_instance
left join (
    select job_instance.dag_instance_id, count(1) as "count"
    from job_instance
    group by dag_instance_id
) as jobInstanceCount
    on jobInstanceCount.dag_instance_id = dag_instance.id
left join workflow
    on workflow.id = dag_instance.workflow_id;
