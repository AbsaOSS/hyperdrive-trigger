-- *********************************************************************
-- SQL to add all changesets to database history table
-- *********************************************************************
-- Change Log: src/main/resources/db_scripts/liquibase/db.changelog.yml
-- Ran at: 1/22/21 6:30 PM
-- Against: xxxxxxx@jdbc:postgresql://localhost:5432/xxxxxxxx
-- Liquibase version: 3.10.2
-- *********************************************************************

SET SEARCH_PATH TO public;

SET SEARCH_PATH TO public;

-- Create Database Lock Table
CREATE TABLE databasechangeloglock (ID INTEGER NOT NULL, LOCKED BOOLEAN NOT NULL, LOCKGRANTED TIMESTAMP WITHOUT TIME ZONE, LOCKEDBY VARCHAR(255), CONSTRAINT DATABASECHANGELOGLOCK_PKEY PRIMARY KEY (ID));

-- Initialize Database Lock Table
DELETE FROM databasechangeloglock;

INSERT INTO databasechangeloglock (ID, LOCKED) VALUES (1, FALSE);

-- Lock Database
UPDATE databasechangeloglock SET LOCKED = TRUE, LOCKEDBY = '0b47663e-df43-4599-8cf9-c06fea90d2a6', LOCKGRANTED = '2021-01-22 18:30:01.614' WHERE ID = 1 AND LOCKED = FALSE;

SET SEARCH_PATH TO public;

-- Create Database Change Log Table
CREATE TABLE databasechangelog (ID VARCHAR(255) NOT NULL, AUTHOR VARCHAR(255) NOT NULL, FILENAME VARCHAR(255) NOT NULL, DATEEXECUTED TIMESTAMP WITHOUT TIME ZONE NOT NULL, ORDEREXECUTED INTEGER NOT NULL, EXECTYPE VARCHAR(10) NOT NULL, MD5SUM VARCHAR(35), DESCRIPTION VARCHAR(255), COMMENTS VARCHAR(255), TAG VARCHAR(255), LIQUIBASE VARCHAR(20), CONTEXTS VARCHAR(255), LABELS VARCHAR(255), DEPLOYMENT_ID VARCHAR(10));

SET SEARCH_PATH TO public;

SET SEARCH_PATH TO public;

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('v0.1.0.initial-create', 'HyperdriveDevTeam@absa.africa', 'v0.1.0.initial-create', NOW(), 1, '8:89139d4c708def5fce73bbd47334f8b1', 'sqlFile', '', 'EXECUTED', 'default', NULL, '3.10.2', '1336601767');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('v0.1.0.add-started-finished', 'HyperdriveDevTeam@absa.africa', 'v0.1.0.add-started-finished', NOW(), 2, '8:f70938e6d526d71fd3874adfd52e79c1', 'sqlFile', '', 'EXECUTED', 'default', NULL, '3.10.2', '1336601767');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('v0.1.3.add-key-value-pairs', 'HyperdriveDevTeam@absa.africa', 'v0.1.3.add-key-value-pairs', NOW(), 3, '8:e8cebc04cbd5b57fb5fc7f7986ef1341', 'sqlFile', '', 'EXECUTED', 'default', NULL, '3.10.2', '1336601767');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('v0.2.0.add-workflow-history', 'HyperdriveDevTeam@absa.africa', 'v0.2.0.add-workflow-history', NOW(), 4, '8:a786a8311fbe19c5db31f7fbbf5c3dd9', 'sqlFile', '', 'EXECUTED', 'default', NULL, '3.10.2', '1336601767');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('v0.2.0.add-workflow-id-to-dag-run-view', 'HyperdriveDevTeam@absa.africa', 'v0.2.0.add-workflow-id-to-dag-run-view', NOW(), 5, '8:7ddae7eced01d161e731e75d7e504a86', 'sqlFile', '', 'EXECUTED', 'default', NULL, '3.10.2', '1336601767');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('v0.2.0.add-job-template', 'HyperdriveDevTeam@absa.africa', 'v0.2.0.add-job-template', NOW(), 6, '8:ac942942e1af37b9f3b51640941bfa0f', 'sqlFile', '', 'EXECUTED', 'default', NULL, '3.10.2', '1336601767');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('v0.2.0.delete-job-type', 'HyperdriveDevTeam@absa.africa', 'v0.2.0.delete-job-type', NOW(), 7, '8:dc26d32dc134c39cbc9c3e990d9fb99c', 'sqlFile', '', 'EXECUTED', 'default', NULL, '3.10.2', '1336601767');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('v0.2.0.add-triggered-by', 'HyperdriveDevTeam@absa.africa', 'v0.2.0.add-triggered-by', NOW(), 8, '8:20947f500206c9f3dcbced94d9079582', 'sqlFile', '', 'EXECUTED', 'default', NULL, '3.10.2', '1336601767');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('v0.2.0.add-form-config', 'HyperdriveDevTeam@absa.africa', 'v0.2.0.add-form-config', NOW(), 9, '8:8307cd2123b652fd737156dfdc6c7cbe', 'sqlFile', '', 'EXECUTED', 'default', NULL, '3.10.2', '1336601767');

INSERT INTO databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('v0.3.3.add-indexes', 'HyperdriveDevTeam@absa.africa', 'v0.3.3.add-indexes', NOW(), 12, '8:6571c7a4199c7c2563dc34fafaccc80b', 'sqlFile', '', 'EXECUTED', 'default', NULL, '3.10.2', '1336601767');

-- Release Database Lock
SET SEARCH_PATH TO public;

UPDATE databasechangeloglock SET LOCKED = FALSE, LOCKEDBY = NULL, LOCKGRANTED = NULL WHERE ID = 1;

SET SEARCH_PATH TO public;

