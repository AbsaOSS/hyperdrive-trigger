create table "workflow" (
  "name" VARCHAR(45) NOT NULL UNIQUE,
  "is_active" BOOLEAN NOT NULL,
  "created" TIMESTAMP NOT NULL,
  "updated" TIMESTAMP,
  "id" BIGSERIAL NOT NULL PRIMARY KEY
);

create table "job_instance" (
  "job_name" VARCHAR NOT NULL,
  "job_type" VARCHAR NOT NULL,
  "variables" VARCHAR NOT NULL,
  "maps" VARCHAR NOT NULL,
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
  "order" INTEGER NOT NULL,
  "id" BIGSERIAL NOT NULL PRIMARY KEY
);

create table "sensor" (
  "workflow_id" BIGINT NOT NULL,
  "sensor_type" VARCHAR NOT NULL,
  "variables" VARCHAR NOT NULL,
  "maps" VARCHAR NOT NULL,
  "match_properties" VARCHAR NOT NULL,
  "id" BIGSERIAL NOT NULL PRIMARY
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
