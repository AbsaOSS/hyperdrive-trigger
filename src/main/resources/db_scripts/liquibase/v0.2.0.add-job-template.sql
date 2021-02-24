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
-- copy of db_scripts/delta_script_v4_to_v5.sql

create table "job_template" (
  "name" VARCHAR NOT NULL UNIQUE,
  "job_type" VARCHAR NOT NULL,
  "variables" VARCHAR NOT NULL,
  "maps" VARCHAR NOT NULL,
  "key_value_pairs" VARCHAR NOT NULL,
  "id" BIGSERIAL NOT NULL PRIMARY KEY
);

insert into "job_template" ("name", "job_type", "variables", "maps", "key_value_pairs")
values ('Generic Spark Job', 'Spark', '{}', '{}', '{}');
insert into "job_template" ("name", "job_type", "variables", "maps", "key_value_pairs")
values ('Generic Shell Job', 'Shell', '{}', '{}', '{}');

alter table "job_definition"
add "job_template_id" BIGINT;

alter table "job_definition"
add constraint "job_definition_job_template_fk"
foreign key("job_template_id")
references "job_template"("id")
on update NO ACTION on delete NO ACTION;

update "job_definition" set "job_template_id" = (select id from job_template where name = 'Generic Spark Job')
where "job_type" = 'Spark';
update "job_definition" set "job_template_id" = (select id from job_template where name = 'Generic Shell Job')
where "job_type" = 'Shell';

alter table "job_definition"
alter column "job_template_id" SET NOT NULL;

-- delete later to enable simple rollback
alter table "job_definition"
rename column "job_type" to "deprecated_job_type";

alter table "job_definition"
alter column "deprecated_job_type" drop not null;
