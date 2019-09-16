create table "workflow" (
  "name" VARCHAR(45) NOT NULL UNIQUE,
  "is_active" BOOLEAN NOT NULL,
  "created" TIMESTAMP NOT NULL,
  "updated" TIMESTAMP,
  "id" BIGSERIAL NOT NULL PRIMARY KEY
);

create table "job_instance" (
  "job_name" VARCHAR NOT NULL,
  "job_definition_id" BIGINT NOT NULL,
  "event_id" VARCHAR(70) NOT NULL UNIQUE,
  "job_type" VARCHAR NOT NULL,
  "variables" VARCHAR NOT NULL,
  "maps" VARCHAR NOT NULL,
  "job_status" VARCHAR NOT NULL,
  "executor_job_id" VARCHAR,
  "created" TIMESTAMP NOT NULL,
  "updated" TIMESTAMP,
  "id" BIGSERIAL NOT NULL PRIMARY KEY
);

create table "job_definition" (
  "workflow_id" BIGINT NOT NULL,
  "name" VARCHAR NOT NULL,
  "job_type" VARCHAR NOT NULL,
  "variables" VARCHAR NOT NULL,
  "maps" VARCHAR NOT NULL,
  "id" BIGSERIAL NOT NULL PRIMARY KEY
);

create table "event_trigger" (
  "workflow_id" BIGINT NOT NULL,
  "event_type" VARCHAR NOT NULL,
  "variables" VARCHAR NOT NULL,
  "maps" VARCHAR NOT NULL,
  "match_properties" VARCHAR NOT NULL,
  "id" BIGSERIAL NOT NULL PRIMARY KEY
);

create table "event" (
  "sensor_event_id" VARCHAR(70) NOT NULL UNIQUE,
  "payload" VARCHAR NOT NULL,
  "id" BIGSERIAL NOT NULL PRIMARY KEY
);
