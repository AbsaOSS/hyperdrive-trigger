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

alter table sensor add properties jsonb not null default '{}';
update sensor set properties = variables::jsonb || maps::jsonb || match_properties::jsonb;
update sensor
set properties = properties::jsonb || ('{"sensorType":"' || sensor_type || '"}' )::jsonb;


alter table sensor alter column variables drop not null;
alter table sensor alter column variables set default '{}';
alter table sensor rename column variables to variables_old;

alter table sensor alter column maps drop not null;
alter table sensor alter column maps set default '{}';
alter table sensor rename column maps to maps_old;

alter table sensor alter column match_properties drop not null;
alter table sensor alter column match_properties set default '{}';
alter table sensor rename column match_properties to match_properties_old;

alter table sensor rename column sensor_type to sensor_type_old;
alter table sensor alter column sensor_type_old drop not null;

update workflow_history
set workflow = jsonb_set(
    workflow_history.workflow::jsonb,
    array ['sensor', 'properties'],
    (workflow_history.workflow::jsonb -> 'sensor' -> 'properties' -> 'matchProperties')::jsonb ||
    (workflow_history.workflow::jsonb -> 'sensor' -> 'properties' -> 'settings' -> 'variables')::jsonb ||
    (workflow_history.workflow::jsonb -> 'sensor' -> 'properties' -> 'settings' -> 'maps')::jsonb ||
    ('{"sensorType":' || (workflow_history.workflow::jsonb -> 'sensor' -> 'sensorType' -> 'name')::text || '}')::jsonb,
    true
);