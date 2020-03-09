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


alter table "dag_instance"
ADD started TIMESTAMP NOT NULL DEFAULT NOW();

alter table "dag_instance"
ADD finished TIMESTAMP DEFAULT NOW();

UPDATE dag_instance
SET finished = (
    SELECT MAX(job_instance.updated)
    FROM job_instance
    WHERE dag_instance.id = job_instance.dag_instance_id
);

UPDATE dag_instance
SET started = (
    SELECT MIN(job_instance.created)
    FROM job_instance
    WHERE dag_instance.id = job_instance.dag_instance_id
);

CREATE VIEW run_view AS
SELECT
    dagInstance.id as id,
    w.name as workflow_name,
    w.project as project_name,
    COALESCE(jobInstanceCount.count, 0) as job_count,
    dagInstance.started as started,
    dagInstance.finished as finished,
    dagInstance.status as status
FROM dag_instance as dagInstance
         LEFT JOIN (
            SELECT job_instance.dag_instance_id, count(1) as count
            FROM job_instance
            GROUP BY dag_instance_id
        ) as jobInstanceCount
        ON jobInstanceCount.dag_instance_id = dagInstance.id
        LEFT JOIN workflow as w
        ON w.id = dagInstance.workflow_id;
