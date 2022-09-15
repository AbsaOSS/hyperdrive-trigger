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
  "id" BIGSERIAL NOT NULL PRIMARY KEY,
  "scheduler_instance_id" BIGINT
);

create table "job_instance" (
  "job_name" VARCHAR NOT NULL,
  "job_status" VARCHAR NOT NULL,
  "executor_job_id" VARCHAR,
  "created" TIMESTAMP NOT NULL,
  "updated" TIMESTAMP,
  "order" INTEGER NOT NULL,
  "dag_instance_id" BIGINT NOT NULL,
  "id" BIGSERIAL NOT NULL PRIMARY KEY,
  "application_id" VARCHAR,
  "step_id" VARCHAR,
  "job_parameters" JSONB NOT NULL DEFAULT '{}'
);

create table "job_definition" (
  "dag_definition_id" BIGINT NOT NULL,
  "name" VARCHAR NOT NULL,
  "order" INTEGER NOT NULL,
  "id" BIGSERIAL NOT NULL PRIMARY KEY,
  "job_template_id" BIGINT,
  "job_parameters" JSONB NOT NULL DEFAULT '{}'
);

create table "sensor" (
  "workflow_id" BIGINT NOT NULL,
  "sensor_type_old" VARCHAR,
  "variables_old" VARCHAR,
  "maps_old" VARCHAR,
  "match_properties_old" VARCHAR,
  "id" BIGSERIAL NOT NULL PRIMARY KEY,
  "properties" JSONB NOT NULL DEFAULT '{}'
);

create table "event" (
  "sensor_event_id" VARCHAR(70) NOT NULL UNIQUE,
  "sensor_id" BIGINT NOT NULL,
  "dag_instance_id" BIGINT,
  "id" BIGSERIAL NOT NULL PRIMARY KEY,
  "payload" JSONB NOT NULL
);

create table "dag_definition" (
  "workflow_id" BIGINT NOT NULL,
  "id" BIGSERIAL NOT NULL PRIMARY KEY
);

create table "dag_instance" (
  "status" VARCHAR NOT NULL,
  "workflow_id" BIGINT NOT NULL,
  "id" BIGSERIAL NOT NULL PRIMARY KEY,
  "started" TIMESTAMP NOT NULL,
  "finished" TIMESTAMP,
  "triggered_by" VARCHAR NOT NULL
);

create table "workflow_history" (
  "id" BIGSERIAL NOT NULL PRIMARY KEY,
  "changed_on" TIMESTAMP NOT NULL,
  "changed_by" VARCHAR NOT NULL,
  "operation" VARCHAR NOT NULL,
  "workflow_id" BIGINT NOT NULL,
  "workflow" VARCHAR NOT NULL
);

create table "job_template" (
  "name" VARCHAR NOT NULL UNIQUE,
  "id" BIGSERIAL NOT NULL PRIMARY KEY,
  "form_config_old" VARCHAR DEFAULT 'NotUsed',
  "job_parameters" JSONB NOT NULL DEFAULT '{}'
);

create table "job_template_history" (
    "id" BIGSERIAL NOT NULL PRIMARY KEY,
    "changed_on" TIMESTAMP NOT NULL,
    "changed_by" VARCHAR NOT NULL,
    "operation" VARCHAR NOT NULL,
    "job_template_id" BIGINT NOT NULL,
    "job_template" VARCHAR NOT NULL
);

create table "scheduler_instance" (
  "id" BIGSERIAL NOT NULL PRIMARY KEY,
  "status" VARCHAR NOT NULL,
  "last_heartbeat" TIMESTAMP NOT NULL
);

create table "notification_rule" (
  "id" BIGSERIAL NOT NULL PRIMARY KEY,
  "is_active" BOOLEAN NOT NULL,
  "project" VARCHAR,
  "workflow_prefix" VARCHAR,
  "min_elapsed_secs_last_success" BIGINT,
  "statuses" JSONB NOT NULL DEFAULT '{}',
  "recipients" JSONB NOT NULL DEFAULT '{}',
  "created" TIMESTAMP NOT NULL,
  "updated" TIMESTAMP
);

create table "notification_rule_history" (
  "id" BIGSERIAL NOT NULL PRIMARY KEY,
  "changed_on" TIMESTAMP NOT NULL,
  "changed_by" VARCHAR NOT NULL,
  "operation" VARCHAR NOT NULL,
  "notification_rule_id" BIGINT NOT NULL,
  "notification_rule" JSONB NOT NULL
);

create table archive_dag_instance
(
    status       varchar                                        not null,
    workflow_id  bigint                                         not null,
    id           bigint primary key,
    started      timestamp default now()                        not null,
    finished     timestamp,
    triggered_by varchar   default 'unknown'::character varying not null
);

create table archive_job_instance
(
    job_name         varchar                   not null,
    job_status       varchar                   not null,
    executor_job_id  varchar,
    created          timestamp                 not null,
    updated          timestamp,
    "order"          integer                   not null,
    dag_instance_id  bigint                    not null
        constraint archive_job_instance_archive_dag_instance_idx
            references archive_dag_instance,
    id               bigint primary key,
    application_id   varchar,
    step_id          varchar
);

create table archive_event
(
    sensor_event_id varchar(70)         not null unique,
    sensor_id       bigint              not null,
    dag_instance_id bigint
    constraint archive_event_archive_dag_instance_fk
        references archive_dag_instance,
    id              bigint primary key,
    payload         jsonb               not null
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

alter table "job_definition"
add constraint "job_definition_job_template_fk"
foreign key("job_template_id")
references "job_template"("id")
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

alter table "workflow"
  add constraint "workflow_scheduler_instance_fk"
  foreign key("scheduler_instance_id")
  references "scheduler_instance"("id")
  on update NO ACTION on delete NO ACTION;

CREATE INDEX job_instance_dag_instance_idx ON job_instance (dag_instance_id);
CREATE INDEX dag_instance_workflow_id_idx ON dag_instance (workflow_id);
CREATE INDEX dag_instance_started_idx ON dag_instance (started);
CREATE INDEX workflow_scheduler_inst_id_idx ON workflow (scheduler_instance_id);
CREATE INDEX event_dag_instance_idx ON "event" (dag_instance_id);


CREATE OR REPLACE PROCEDURE archive_dag_instances(
    IN i_from_ts timestamp default to_timestamp('1970-01-01', 'yyyy-mm-dd'),
    IN i_to_ts timestamp default now() - interval '6 months',
    IN i_max_records int default 50000000,
    IN i_chunk_size int default 100000
)
AS $$
-------------------------------------------------------------------------------
--
-- Procedure: archive_dag_instances(4)
--      Copies dag_instances with a final status from started timestamp i_from_ts
--      to started timestamp i_to_ts to archive_dag_instance table.
--      Along with dag_instance, referenced job_instances and events are
--      copied to the archive_job_instance and archive_event tables, respectively.
--      The copied dag_instances, job_instances and events are then deleted.
--
--      Archiving takes place in chunks of i_chunk_size. The transaction is
--      committed after each chunk completes.
--      The total number of archived dag_instances can be limited by i_max_records.
--
-- Parameters:
--      i_from_ts       - Lower bound for dag instance started timestamp to archive.
--                        Default: 1970-01-01
--      i_to_ts         - Upper bound for dag instance started timestamp to archive.
--                        Default: now minus 6 months
--      i_max_records   - Maximum number of dag instances to archive. Default: 50M
--      i_chunk_size    - Chunk size of transaction. Default: 100K
--
-------------------------------------------------------------------------------
DECLARE
    _min_id BIGINT;
    _max_id BIGINT;
    _current_max BIGINT;
    _max_records_id BIGINT;
BEGIN
    SELECT max(di.id), min(di.id)
    INTO _max_id, _min_id
    FROM dag_instance di
    WHERE di.started >= i_from_ts AND di.started <= i_to_ts
      AND di.status NOT IN ('Running', 'InQueue');

    _max_records_id := LEAST(_max_id, _min_id + i_max_records);
    RAISE NOTICE 'Going to archive dag instances from % to %, approx. %', _min_id, _max_records_id, _max_records_id - _min_id;

    FOR j IN _min_id.._max_records_id BY i_chunk_size LOOP
            _current_max := LEAST(_max_records_id, j + i_chunk_size);
            CALL archive_dag_instances_chunk(j, _current_max);
    COMMIT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE archive_dag_instances_chunk(
    IN i_min_id BIGINT,
    IN i_max_id BIGINT
)
AS $$
-------------------------------------------------------------------------------
--
-- Procedure: archive_dag_instances_chunk(2)
--      Copies dag_instances with a final status from i_min_id to i_max_id to the
--      archive_dag_instance table.
--      Along with dag_instance, referenced job_instances and events are
--      archived to the archive_job_instance and archive_event tables, respectively.
--      This method should not be called directly. Instead, use archive_dag_instances
--
-- Parameters:
--      i_min_id             - Minimum dag instance id to archive
--      i_max_id             - Maximum dag instance id to archive
--
-------------------------------------------------------------------------------
DECLARE
    _cnt INT;
BEGIN
    RAISE NOTICE '=============';
    RAISE NOTICE ' START BATCH';
    RAISE NOTICE '=============';

    CREATE TEMPORARY TABLE dag_instance_ids_to_archive AS
    SELECT di.id
    FROM dag_instance di
    WHERE di.status NOT IN ('Running', 'InQueue')
      AND di.id >= i_min_id
      AND di.id <= i_max_id;
    GET DIAGNOSTICS _cnt = ROW_COUNT;
    RAISE NOTICE 'Going to archive % dag instances from % to %', _cnt, i_min_id, i_max_id;

    INSERT INTO archive_dag_instance (status, workflow_id, id, started, finished, triggered_by)
    SELECT di.status, di.workflow_id, di.id, di.started, di.finished, di.triggered_by
    FROM dag_instance di
             JOIN dag_instance_ids_to_archive diita ON di.id = diita.id
    ON CONFLICT (id) DO NOTHING;
    GET DIAGNOSTICS _cnt = ROW_COUNT;
    RAISE NOTICE 'Archived % dag instances from % to %', _cnt, i_min_id, i_max_id;

    INSERT INTO archive_job_instance (job_name, job_status, executor_job_id, created, updated, "order", dag_instance_id, id, application_id, step_id)
    SELECT ji.job_name, ji.job_status, ji.executor_job_id, ji.created, ji.updated, ji."order", ji.dag_instance_id, ji.id, ji.application_id, ji.step_id
    FROM job_instance ji
             JOIN dag_instance_ids_to_archive diita ON ji.dag_instance_id = diita.id
    ON CONFLICT (id) DO NOTHING;
    GET DIAGNOSTICS _cnt = ROW_COUNT;
    RAISE NOTICE 'Archived % job instances', _cnt;

    INSERT INTO archive_event (sensor_event_id, sensor_id, dag_instance_id, id, payload)
    SELECT e.sensor_event_id, e.sensor_id, e.dag_instance_id, e.id, e.payload
    FROM "event" e
             JOIN dag_instance_ids_to_archive diita ON e.dag_instance_id = diita.id
    ON CONFLICT (id) DO NOTHING;
    GET DIAGNOSTICS _cnt = ROW_COUNT;
    RAISE NOTICE 'Archived % events', _cnt;

    RAISE NOTICE 'Going to delete dag instances';

    DELETE FROM job_instance ji
        USING dag_instance_ids_to_archive diita
    WHERE ji.dag_instance_id = diita.id;
    GET DIAGNOSTICS _cnt = ROW_COUNT;
    RAISE NOTICE 'Deleted % job instances', _cnt;

    DELETE FROM "event" e
        USING dag_instance_ids_to_archive diita
    WHERE e.dag_instance_id = diita.id;
    GET DIAGNOSTICS _cnt = ROW_COUNT;
    RAISE NOTICE 'Deleted % events', _cnt;

    DELETE FROM dag_instance di
    USING dag_instance_ids_to_archive diita
    WHERE di.id = diita.id;
    GET DIAGNOSTICS _cnt = ROW_COUNT;
    RAISE NOTICE 'Deleted % dag instances', _cnt;

    DROP TABLE dag_instance_ids_to_archive;

    RAISE NOTICE '=============';
    RAISE NOTICE '  END BATCH';
    RAISE NOTICE '=============';
END;
$$ LANGUAGE plpgsql;
