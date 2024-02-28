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

ALTER TABLE "job_instance"
    ADD COLUMN "diagnostics" VARCHAR;
ALTER TABLE "archive_job_instance"
    ADD COLUMN "diagnostics" VARCHAR;



CREATE OR REPLACE PROCEDURE archive_dag_instances_chunk(
    IN i_min_id BIGINT,
    IN i_max_id BIGINT
)
AS $$
-------------------------------------------------------------------------------
--
-- Procedure: archive_dag_instances_chunk(2)
--      Copies dag_instances with a final status from i_min_id to i_max_id to the
--      archive_dag_instance table.
--      Along with dag_instance, referenced job_instances and events are
--      archived to the archive_job_instance and archive_event tables, respectively.
--      This method should not be called directly. Instead, use archive_dag_instances
--
-- Parameters:
--      i_min_id             - Minimum dag instance id to archive
--      i_max_id             - Maximum dag instance id to archive
--
-------------------------------------------------------------------------------
DECLARE
    _cnt INT;
BEGIN
    RAISE NOTICE '=============';
    RAISE NOTICE ' START BATCH';
    RAISE NOTICE '=============';

    CREATE TEMPORARY TABLE dag_instance_ids_to_archive AS
    SELECT di.id
    FROM dag_instance di
    WHERE di.status NOT IN ('Running', 'InQueue')
      AND di.id >= i_min_id
      AND di.id <= i_max_id;
    GET DIAGNOSTICS _cnt = ROW_COUNT;
    RAISE NOTICE 'Going to archive % dag instances from % to %', _cnt, i_min_id, i_max_id;

    INSERT INTO archive_dag_instance (status, workflow_id, id, started, finished, triggered_by)
    SELECT di.status, di.workflow_id, di.id, di.started, di.finished, di.triggered_by
    FROM dag_instance di
    JOIN dag_instance_ids_to_archive diita ON di.id = diita.id
    ON CONFLICT (id) DO NOTHING;
    GET DIAGNOSTICS _cnt = ROW_COUNT;
    RAISE NOTICE 'Archived % dag instances from % to %', _cnt, i_min_id, i_max_id;

    INSERT INTO archive_job_instance (job_name, job_status, executor_job_id, created, updated, "order", dag_instance_id, id, application_id, step_id, diagnostics)
    SELECT ji.job_name, ji.job_status, ji.executor_job_id, ji.created, ji.updated, ji."order", ji.dag_instance_id, ji.id, ji.application_id, ji.step_id, ji.diagnostics
    FROM job_instance ji
    JOIN dag_instance_ids_to_archive diita ON ji.dag_instance_id = diita.id
    ON CONFLICT (id) DO NOTHING;
    GET DIAGNOSTICS _cnt = ROW_COUNT;
    RAISE NOTICE 'Archived % job instances', _cnt;

    INSERT INTO archive_event (sensor_event_id, sensor_id, dag_instance_id, id, payload)
    SELECT e.sensor_event_id, e.sensor_id, e.dag_instance_id, e.id, e.payload
    FROM "event" e
    JOIN dag_instance_ids_to_archive diita ON e.dag_instance_id = diita.id
    ON CONFLICT (id) DO NOTHING;
    GET DIAGNOSTICS _cnt = ROW_COUNT;
    RAISE NOTICE 'Archived % events', _cnt;

    RAISE NOTICE 'Going to delete dag instances';

    DELETE FROM job_instance ji
    USING dag_instance_ids_to_archive diita
    WHERE ji.dag_instance_id = diita.id;
    GET DIAGNOSTICS _cnt = ROW_COUNT;
    RAISE NOTICE 'Deleted % job instances', _cnt;

    DELETE FROM "event" e
    USING dag_instance_ids_to_archive diita
    WHERE e.dag_instance_id = diita.id;
    GET DIAGNOSTICS _cnt = ROW_COUNT;
    RAISE NOTICE 'Deleted % events', _cnt;

    DELETE FROM dag_instance di
    USING dag_instance_ids_to_archive diita
    WHERE di.id = diita.id;
    GET DIAGNOSTICS _cnt = ROW_COUNT;
    RAISE NOTICE 'Deleted % dag instances', _cnt;

    DROP TABLE dag_instance_ids_to_archive;

    RAISE NOTICE '=============';
    RAISE NOTICE '  END BATCH';
    RAISE NOTICE '=============';
END;
$$ LANGUAGE plpgsql;
