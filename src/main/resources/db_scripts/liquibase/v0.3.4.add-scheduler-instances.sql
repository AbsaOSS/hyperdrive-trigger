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

create table "scheduler_instance" (
  "id" BIGSERIAL NOT NULL PRIMARY KEY,
  "status" VARCHAR NOT NULL,
  "last_heartbeat" TIMESTAMP NOT NULL
);

alter table "workflow" add column "scheduler_instance_id" BIGINT;

alter table "workflow"
  add constraint "workflow_scheduler_instance_fk"
  foreign key("scheduler_instance_id")
  references "scheduler_instance"("id")
  on update NO ACTION on delete NO ACTION;

CREATE INDEX workflow_scheduler_inst_id_idx ON workflow (scheduler_instance_id);
