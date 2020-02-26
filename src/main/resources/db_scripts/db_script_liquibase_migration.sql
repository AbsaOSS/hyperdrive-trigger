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


-- Create Database Lock Table
CREATE TABLE databasechangeloglock (ID INTEGER NOT NULL, LOCKED BOOLEAN NOT NULL, LOCKGRANTED TIMESTAMP WITHOUT TIME ZONE, LOCKEDBY VARCHAR(255), CONSTRAINT DATABASECHANGELOGLOCK_PKEY PRIMARY KEY (ID));

-- Initialize Database Lock Table
DELETE FROM databasechangeloglock WHERE 1=1;

INSERT INTO databasechangeloglock (ID, LOCKED) VALUES (1, FALSE);

-- Lock Database
UPDATE databasechangeloglock SET LOCKED = TRUE, LOCKEDBY = '24.148.101.8 (24.148.101.8)', LOCKGRANTED = '2020-02-26 17:20:44.772' WHERE ID = 1 AND LOCKED = FALSE;

-- Create Database Change Log Table
CREATE TABLE databasechangelog (ID VARCHAR(255) NOT NULL, AUTHOR VARCHAR(255) NOT NULL, FILENAME VARCHAR(255) NOT NULL, DATEEXECUTED TIMESTAMP WITHOUT TIME ZONE NOT NULL, ORDEREXECUTED INTEGER NOT NULL, EXECTYPE VARCHAR(10) NOT NULL, MD5SUM VARCHAR(35), DESCRIPTION VARCHAR(255), COMMENTS VARCHAR(255), TAG VARCHAR(255), LIQUIBASE VARCHAR(20), CONTEXTS VARCHAR(255), LABELS VARCHAR(255), DEPLOYMENT_ID VARCHAR(10));

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('1582729544399-1', 'kevin.wallimann@absa.africa', 'db_scripts/liquibase/v0.0.1.initial-create.yml', NOW(), 1, '8:297214d1b6521716f80035aaa34950e6', 'createTable tableName=job_definition', '', 'EXECUTED', 'default', NULL, '3.8.6', '2734045536');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('1582729544399-2', 'kevin.wallimann@absa.africa', 'db_scripts/liquibase/v0.0.1.initial-create.yml', NOW(), 2, '8:6bb0b2d927582e931634ab3520bde656', 'createTable tableName=sensor', '', 'EXECUTED', 'default', NULL, '3.8.6', '2734045536');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('1582729544399-3', 'kevin.wallimann@absa.africa', 'db_scripts/liquibase/v0.0.1.initial-create.yml', NOW(), 3, '8:6f2ed9f8f14b0c2b3a67955c1cf40827', 'createTable tableName=job_instance', '', 'EXECUTED', 'default', NULL, '3.8.6', '2734045536');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('1582729544399-4', 'kevin.wallimann@absa.africa', 'db_scripts/liquibase/v0.0.1.initial-create.yml', NOW(), 4, '8:4c567980e857f6118427d20a330539b7', 'createTable tableName=dag_definition', '', 'EXECUTED', 'default', NULL, '3.8.6', '2734045536');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('1582729544399-5', 'kevin.wallimann@absa.africa', 'db_scripts/liquibase/v0.0.1.initial-create.yml', NOW(), 5, '8:436ccc5370b3e64ef75e5bc0f3c62b48', 'createTable tableName=dag_instance', '', 'EXECUTED', 'default', NULL, '3.8.6', '2734045536');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('1582729544399-6', 'kevin.wallimann@absa.africa', 'db_scripts/liquibase/v0.0.1.initial-create.yml', NOW(), 6, '8:c951888113081465c22df8be73c1eee4', 'createTable tableName=workflow', '', 'EXECUTED', 'default', NULL, '3.8.6', '2734045536');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('1582729544399-7', 'kevin.wallimann@absa.africa', 'db_scripts/liquibase/v0.0.1.initial-create.yml', NOW(), 7, '8:d09d26b653b2cf3e62d263027a4a1288', 'createTable tableName=event', '', 'EXECUTED', 'default', NULL, '3.8.6', '2734045536');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('1582729544399-8', 'kevin.wallimann@absa.africa', 'db_scripts/liquibase/v0.0.1.initial-create.yml', NOW(), 8, '8:7337490851f3456b234e7ae4f0c90336', 'addForeignKeyConstraint baseTableName=job_definition, constraintName=job_definition_dag_definition_fk, referencedTableName=dag_definition', '', 'EXECUTED', 'default', NULL, '3.8.6', '2734045536');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('1582729544399-9', 'kevin.wallimann@absa.africa', 'db_scripts/liquibase/v0.0.1.initial-create.yml', NOW(), 9, '8:186ac087ec5c106eacef4eba9c871383', 'addForeignKeyConstraint baseTableName=event, constraintName=event_dag_instance_fk, referencedTableName=dag_instance', '', 'EXECUTED', 'default', NULL, '3.8.6', '2734045536');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('1582729544399-10', 'kevin.wallimann@absa.africa', 'db_scripts/liquibase/v0.0.1.initial-create.yml', NOW(), 10, '8:eb1e46c1da8a5334475c53151ea75730', 'addForeignKeyConstraint baseTableName=job_instance, constraintName=job_instance_dag_instance_fk, referencedTableName=dag_instance', '', 'EXECUTED', 'default', NULL, '3.8.6', '2734045536');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('1582729544399-11', 'kevin.wallimann@absa.africa', 'db_scripts/liquibase/v0.0.1.initial-create.yml', NOW(), 11, '8:60f26c273f00d116b76c0239fba806f8', 'addUniqueConstraint constraintName=workflow_name_key, tableName=workflow', '', 'EXECUTED', 'default', NULL, '3.8.6', '2734045536');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('1582729544399-12', 'kevin.wallimann@absa.africa', 'db_scripts/liquibase/v0.0.1.initial-create.yml', NOW(), 12, '8:32c3267312070e601910a6a59f9de574', 'addUniqueConstraint constraintName=event_sensor_event_id_key, tableName=event', '', 'EXECUTED', 'default', NULL, '3.8.6', '2734045536');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('1582729544399-13', 'kevin.wallimann@absa.africa', 'db_scripts/liquibase/v0.0.1.initial-create.yml', NOW(), 13, '8:1fe2f67664901e98047d1937adb76b39', 'addForeignKeyConstraint baseTableName=event, constraintName=event_sensor_fk, referencedTableName=sensor', '', 'EXECUTED', 'default', NULL, '3.8.6', '2734045536');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('1582729544399-14', 'kevin.wallimann@absa.africa', 'db_scripts/liquibase/v0.0.1.initial-create.yml', NOW(), 14, '8:3ce8cd9b466a16bf71eef2085f63f553', 'addForeignKeyConstraint baseTableName=sensor, constraintName=sensor_workflow_fk, referencedTableName=workflow', '', 'EXECUTED', 'default', NULL, '3.8.6', '2734045536');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('1582729544399-15', 'kevin.wallimann@absa.africa', 'db_scripts/liquibase/v0.0.1.initial-create.yml', NOW(), 15, '8:8b6c2dee59957df2a42471c275391b19', 'addForeignKeyConstraint baseTableName=dag_definition, constraintName=dag_definition_workflow_fk, referencedTableName=workflow', '', 'EXECUTED', 'default', NULL, '3.8.6', '2734045536');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('1582729544399-16', 'kevin.wallimann@absa.africa', 'db_scripts/liquibase/v0.0.1.initial-create.yml', NOW(), 16, '8:0fb2aa1e36abac49c720dcaac29e62c2', 'addForeignKeyConstraint baseTableName=dag_instance, constraintName=dag_instance_workflow_fk, referencedTableName=workflow', '', 'EXECUTED', 'default', NULL, '3.8.6', '2734045536');

-- Release Database Lock
UPDATE databasechangeloglock SET LOCKED = FALSE, LOCKEDBY = NULL, LOCKGRANTED = NULL WHERE ID = 1;

