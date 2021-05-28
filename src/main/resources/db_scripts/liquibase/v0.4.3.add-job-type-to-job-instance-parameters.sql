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

update job_instance
set job_parameters = job_parameters::jsonb || ('{"jobType":"' || job_type || '"}' )::jsonb;

alter table job_instance rename column job_type to job_type_old;
alter table job_instance alter column job_type_old drop not null;

