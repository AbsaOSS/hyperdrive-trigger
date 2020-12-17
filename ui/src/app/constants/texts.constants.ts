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

export const texts = {
  DELETE_WORKFLOW_CONFIRMATION_TITLE: 'Delete workflow',
  DELETE_WORKFLOW_CONFIRMATION_CONTENT: 'Are you sure you want to delete this workflow? The operation cannot be reverted.',
  DELETE_WORKFLOW_SUCCESS_NOTIFICATION: 'Workflow has been deleted.',
  DELETE_WORKFLOW_FAILURE_NOTIFICATION: 'Sorry, something went wrong. Try again.',

  SWITCH_WORKFLOW_ACTIVE_STATE_TITLE: 'Switch workflow active state',
  SWITCH_WORKFLOW_ACTIVE_STATE_CONTENT(currentActiveState: boolean): string {
    return 'Are you sure you want to ' + (!currentActiveState ? 'activate' : 'deactivate') + ' this workflow?';
  },
  SWITCH_WORKFLOW_ACTIVE_STATE_SUCCESS_NOTIFICATION(currentActiveState: boolean): string {
    return 'Workflow has been ' + (!currentActiveState ? 'activated' : 'deactivated');
  },
  SWITCH_WORKFLOW_ACTIVE_STATE_FAILURE_NOTIFICATION: 'Sorry, something went wrong. Try again.',

  UPDATE_WORKFLOWS_IS_ACTIVE_TITLE(isActiveNewValue: boolean): string {
    return (isActiveNewValue ? 'Activate' : 'Deactivate') + ' workflows';
  },
  UPDATE_WORKFLOWS_IS_ACTIVE_CONTENT(isActiveNewValue: boolean): string {
    return 'Are you sure you want to ' + (isActiveNewValue ? 'activate' : 'deactivate') + ' the selected workflows?';
  },
  UPDATE_WORKFLOWS_IS_ACTIVE_SUCCESS_NOTIFICATION(isActiveNewValue: boolean): string {
    return 'The workflows have been ' + (isActiveNewValue ? 'activated' : 'deactivated');
  },
  UPDATE_WORKFLOWS_IS_ACTIVE_FAILURE_NOTIFICATION: 'Sorry, something went wrong. Try again.',

  RUN_WORKFLOWS_JOBS_SUCCESS_NOTIFICATION: 'Workflow has been submitted.',
  RUN_WORKFLOWS_JOBS_FAILURE_NOTIFICATION: "Sorry, jobs couldn't be submitted. Please try again.",
  LOAD_JOBS_FOR_RUN_FAILURE_NOTIFICATION: "Sorry, jobs couldn't be loaded. Please try again.",

  CREATE_WORKFLOW_CONFIRMATION_TITLE: 'Create workflow',
  CREATE_WORKFLOW_CONFIRMATION_CONTENT: 'Are you sure you want to create new workflow?',
  CREATE_WORKFLOW_SUCCESS_NOTIFICATION: 'Workflow has been created.',
  CREATE_WORKFLOW_FAILURE_NOTIFICATION: 'Sorry, something went wrong. Try again.',

  UPDATE_WORKFLOW_CONFIRMATION_TITLE: 'Update workflow',
  UPDATE_WORKFLOW_CONFIRMATION_CONTENT: 'Are you sure you want to update the workflow?',
  UPDATE_WORKFLOW_SUCCESS_NOTIFICATION: 'Workflow has been updated.',
  UPDATE_WORKFLOW_FAILURE_NOTIFICATION: 'Sorry, something went wrong. Try again.',

  EXPORT_WORKFLOWS_SUCCESS_NOTIFICATION: 'Export successful.',
  EXPORT_WORKFLOWS_FAILURE_NOTIFICATION: 'Sorry, something went wrong. Try again.',

  IMPORT_WORKFLOW_SUCCESS_NOTIFICATION: 'Workflow has been imported.',
  IMPORT_WORKFLOW_FAILURE_NOTIFICATION: 'Sorry, something went wrong. Please double-check the import file and try again.',

  IMPORT_WORKFLOWS_SUCCESS_NOTIFICATION: 'Workflows have been imported.',
  IMPORT_WORKFLOWS_FAILURE_NOTIFICATION: 'Sorry, something went wrong. Please double-check the import file and try again.',
  IMPORT_WORKFLOWS_BULK_FAILURE_TITLE: 'Import of workflows failed. Please check the following errors.',

  LOAD_HISTORY_FOR_WORKFLOW_FAILURE_NOTIFICATION: 'Sorry, something went wrong. Try again.',
  LOAD_WORKFLOWS_FROM_HISTORY_FAILURE_NOTIFICATION: 'Sorry, something went wrong. Try again.',

  CRON_QUARTZ_INVALID_FOR_USER_FRIENDLY: 'Invalid quartz expression for user friendly input. Default will be used.',

  FORM_VALIDATION_MUST_BE_FILLED(name: string): string {
    return `${name} must be filled!`;
  },
  FORM_VALIDATION_MIN_LENGTH(name: string, length: number): string {
    return `${name} must be at least ${length} characters long!`;
  },
  FORM_VALIDATION_MAX_LENGTH(name: string, length: number): string {
    return `${name} must be at most ${length} characters long!`;
  },
  FORM_VALIDATION_AT_LEAST_ONE_DEFINED(): string {
    return `At least one must be defined!`;
  },
  FORM_VALIDATION_ONE_MUST_BE_SELECTED(name: string): string {
    return `${name} one option has to be selected!`;
  },
  FORM_VALIDATION_QUARTZ_CRON: 'Quartz cron expression must be set correctly.',
  FORM_VALIDATION_QUARTZ_CRON_CLR_ERR: 'Incorrect expression!',

  LOAD_JOB_TEMPLATE_FAILURE_NOTIFICATION: "Sorry, job template couldn't be loaded. Please try again.",
};
