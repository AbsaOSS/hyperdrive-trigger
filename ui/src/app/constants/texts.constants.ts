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

  RUN_WORKFLOW_CONFIRMATION_TITLE: 'Run workflow',
  RUN_WORKFLOW_CONFIRMATION_CONTENT: 'Do you really want to run the workflow now?',
  RUN_WORKFLOW_SUCCESS_NOTIFICATION: 'The workflow has been dispatched.',
  RUN_WORKFLOW_FAILURE_NOTIFICATION: "Sorry, the workflow couldn't be dispatched. Please try again.",

  CREATE_WORKFLOW_CONFIRMATION_TITLE: 'Create workflow',
  CREATE_WORKFLOW_CONFIRMATION_CONTENT: 'Are you sure you want to create new workflow?',
  CREATE_WORKFLOW_SUCCESS_NOTIFICATION: 'Workflow has been created.',
  CREATE_WORKFLOW_FAILURE_NOTIFICATION: 'Sorry, something went wrong. Try again.',

  UPDATE_WORKFLOW_CONFIRMATION_TITLE: 'Update workflow',
  UPDATE_WORKFLOW_CONFIRMATION_CONTENT: 'Are you sure you want to update the workflow?',
  UPDATE_WORKFLOW_SUCCESS_NOTIFICATION: 'Workflow has been updated.',
  UPDATE_WORKFLOW_FAILURE_NOTIFICATION: 'Sorry, something went wrong. Try again.',

  CRON_QUARTZ_INVALID_FOR_USER_FRIENDLY: 'Invalid quartz expression for user friendly input. Default will be used.'
};
