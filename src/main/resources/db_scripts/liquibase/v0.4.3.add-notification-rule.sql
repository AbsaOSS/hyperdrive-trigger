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

create table "notification_rule" (
  "id" BIGSERIAL NOT NULL PRIMARY KEY,
  "project" VARCHAR,
  "workflow_prefix" VARCHAR,
  "min_elapsed_secs_last_success" BIGINT,
  "statuses" JSONB NOT NULL DEFAULT '{}',
  "recipients" JSONB NOT NULL DEFAULT '{}',
  "created" TIMESTAMP NOT NULL,
  "updated" TIMESTAMP,
  "id" BIGSERIAL NOT NULL PRIMARY KEY
)

create table "notification_rule_history" (
  "id" BIGSERIAL NOT NULL PRIMARY KEY,
  "changed_on" TIMESTAMP NOT NULL,
  "changed_by" VARCHAR NOT NULL,
  "operation" VARCHAR NOT NULL,
  "notification_rule_id" BIGINT NOT NULL,
  "notification_rule" JSONB NOT NULL
);
