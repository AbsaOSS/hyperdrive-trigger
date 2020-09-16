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

create table "workflow" (
  "name" VARCHAR(45) NOT NULL UNIQUE,
  "is_active" BOOLEAN NOT NULL,
  "project" VARCHAR NOT NULL,
  "created" TIMESTAMP NOT NULL,
  "updated" TIMESTAMP,
  "id" BIGSERIAL NOT NULL PRIMARY KEY
);

create table "job_instance" (
  "job_name" VARCHAR NOT NULL,
  "job_type" VARCHAR NOT NULL,
  "variables" VARCHAR NOT NULL,
  "maps" VARCHAR NOT NULL,
  "key_value_pairs" VARCHAR NOT NULL,
  "job_status" VARCHAR NOT NULL,
  "executor_job_id" VARCHAR,
  "created" TIMESTAMP NOT NULL,
  "updated" TIMESTAMP,
  "order" INTEGER NOT NULL,
  "dag_instance_id" BIGINT NOT NULL,
  "id" BIGSERIAL NOT NULL PRIMARY KEY
);

create table "job_definition" (
  "dag_definition_id" BIGINT NOT NULL,
  "name" VARCHAR NOT NULL,
  "job_type" VARCHAR NOT NULL,
  "variables" VARCHAR NOT NULL,
  "maps" VARCHAR NOT NULL,
  "key_value_pairs" VARCHAR NOT NULL,
  "order" INTEGER NOT NULL,
  "id" BIGSERIAL NOT NULL PRIMARY KEY
);

create table "sensor" (
  "workflow_id" BIGINT NOT NULL,
  "sensor_type" VARCHAR NOT NULL,
  "variables" VARCHAR NOT NULL,
  "maps" VARCHAR NOT NULL,
  "match_properties" VARCHAR NOT NULL,
  "id" BIGSERIAL NOT NULL PRIMARY KEY
);

create table "event" (
  "sensor_event_id" VARCHAR(70) NOT NULL UNIQUE,
  "sensor_id" BIGINT NOT NULL,
  "payload" VARCHAR NOT NULL,
  "dag_instance_id" BIGINT,
  "id" BIGSERIAL NOT NULL PRIMARY KEY
);

create table "dag_definition" (
  "workflow_id" BIGINT NOT NULL,
  "id" BIGSERIAL NOT NULL PRIMARY KEY
);

create table "dag_instance" (
  "status" VARCHAR NOT NULL,
  "workflow_id" BIGINT NOT NULL,
  "started" TIMESTAMP NOT NULL,
  "finished" TIMESTAMP,
  "id" BIGSERIAL NOT NULL PRIMARY KEY
);

alter table "job_instance"
  add constraint "job_instance_dag_instance_fk"
  foreign key("dag_instance_id")
  references "dag_instance"("id")
  on update NO ACTION on delete NO ACTION;

alter table "job_definition"
  add constraint "job_definition_dag_definition_fk"
  foreign key("dag_definition_id")
  references "dag_definition"("id")
  on update NO ACTION on delete NO ACTION;

alter table "sensor"
  add constraint "sensor_workflow_fk"
  foreign key("workflow_id")
  references "workflow"("id")
  on update NO ACTION on delete NO ACTION;

alter table "event"
  add constraint "event_dag_instance_fk"
  foreign key("dag_instance_id")
  references "dag_instance"("id")
  on update NO ACTION on delete NO ACTION;

alter table "event"
  add constraint "event_sensor_fk"
  foreign key("sensor_id")
  references "sensor"("id")
  on update NO ACTION on delete NO ACTION;

alter table "dag_definition"
  add constraint "dag_definition_workflow_fk"
  foreign key("workflow_id")
  references "workflow"("id")
  on update NO ACTION on delete NO ACTION;

alter table "dag_instance"
  add constraint "dag_instance_workflow_fk"
  foreign key("workflow_id")
  references "workflow"("id")
  on update NO ACTION on delete NO ACTION;

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
