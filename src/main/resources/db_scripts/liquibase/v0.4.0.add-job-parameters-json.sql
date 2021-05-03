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

alter table event add payload_old varchar null default '{}';
update event set payload_old = payload;
alter table event drop column payload;

alter table event add payload jsonb not null default '{}';
update event set payload = payload_old::jsonb;
alter table event alter column payload drop default;


alter table job_instance alter column variables drop not null;
alter table job_instance alter column variables set default '{}';
alter table job_instance alter column maps drop not null;
alter table job_instance alter column maps set default '{}';
alter table job_instance alter column key_value_pairs drop not null;
alter table job_instance alter column key_value_pairs set default '{}';

alter table job_instance add job_parameters jsonb not null default '{}';
update job_instance
set job_parameters = variables::jsonb || maps::jsonb || key_value_pairs::jsonb;
