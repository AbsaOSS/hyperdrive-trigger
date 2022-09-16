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

create table if not exists archive_dag_instance
(
    status       varchar                                        not null,
    workflow_id  bigint                                         not null,
    id           bigint primary key,
    started      timestamp default now()                        not null,
    finished     timestamp,
    triggered_by varchar   default 'unknown'::character varying not null
);

create table if not exists archive_job_instance
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

create table if not exists archive_event
(
    sensor_event_id varchar(70)         not null unique,
    sensor_id       bigint              not null,
    dag_instance_id bigint
    constraint archive_event_archive_dag_instance_fk
        references archive_dag_instance,
    id              bigint primary key,
    payload         jsonb               not null
);
