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

create table "workflow_history" (
  "id" BIGSERIAL NOT NULL PRIMARY KEY,
  "changed_on" TIMESTAMP NOT NULL,
  "changed_by" VARCHAR NOT NULL,
  "operation" VARCHAR NOT NULL,
  "workflow_id" BIGINT NOT NULL,
  "workflow" VARCHAR NOT NULL
);
