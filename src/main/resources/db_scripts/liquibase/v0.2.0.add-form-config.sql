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

-- copied from delta_script_v7_to_v8.sql

alter table "job_template"
add "form_config" VARCHAR NOT NULL DEFAULT 'unknown';

update "job_template" set "form_config" = 'Spark' where "job_type" = 'Spark';
update "job_template" set "form_config" = 'Shell' where "job_type" = 'Shell';
