alter table "job_instance"
  rename column "event_id"
  to "sensor_event_id";

alter table "event_trigger"
  RENAME TO sensor;

alter table "sensor"
  rename column "event_type"
  to "sensor_type";

delete from "event";

ALTER TABLE "event"
  ADD COLUMN "sensor_id" BIGINT NOT NULL;

alter table "job_instance"
  add constraint "job_instance_job_definition_fk"
  foreign key("job_definition_id")
  references "job_definition"("id")
  on update NO ACTION on delete NO ACTION;

alter table "job_instance"
  add constraint "job_instance_sensor_event_fk"
  foreign key("sensor_event_id")
  references "event"("sensor_event_id")
  on update NO ACTION on delete NO ACTION;

alter table "job_definition"
  add constraint "job_definition_workflow_fk"
  foreign key("workflow_id")
  references "workflow"("id")
  on update NO ACTION on delete NO ACTION;

alter table "sensor"
  add constraint "sensor_workflow_fk"
  foreign key("workflow_id")
  references "workflow"("id")
  on update NO ACTION on delete NO ACTION;

alter table "event"
  add constraint "event_sensor_fk"
  foreign key("sensor_id")
  references "sensor"("id")
  on update NO ACTION on delete NO ACTION;
