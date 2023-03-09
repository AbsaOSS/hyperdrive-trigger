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

import { Action } from '@ngrx/store';
import { ProjectModel } from '../../models/project.model';
import { WorkflowJoinedModel } from '../../models/workflowJoined.model';
import { WorkflowModel } from '../../models/workflow.model';
import { HistoryModel, WorkflowHistoryModel } from '../../models/historyModel';
import { JobForRunModel } from '../../models/jobForRun.model';
import { JobTemplateModel } from '../../models/jobTemplate.model';
import { TableSearchRequestModel } from '../../models/search/tableSearchRequest.model';
import { IngestionStatusModel } from '../../models/ingestionStatus.model';

export const INITIALIZE_WORKFLOWS = 'INITIALIZE_WORKFLOWS';
export const INITIALIZE_WORKFLOWS_SUCCESS = 'INITIALIZE_WORKFLOWS_SUCCESS';
export const INITIALIZE_WORKFLOWS_FAILURE = 'INITIALIZE_WORKFLOWS_FAILURE';

export const START_WORKFLOW_INITIALIZATION = 'START_WORKFLOW_INITIALIZATION';
export const SET_EMPTY_WORKFLOW = 'SET_EMPTY_WORKFLOW';
export const LOAD_WORKFLOW_SUCCESS = 'LOAD_WORKFLOW_SUCCESS';
export const LOAD_WORKFLOW_FAILURE_INCORRECT_ID = 'LOAD_WORKFLOW_FAILURE_INCORRECT_ID';
export const LOAD_WORKFLOW_FAILURE = 'LOAD_WORKFLOW_FAILURE';

export const WORKFLOW_CHANGED = 'WORKFLOW_CHANGED';
export const WORKFLOW_ACTION_CHANGED = 'WORKFLOW_ACTION_CHANGED';

export const DELETE_WORKFLOW = 'DELETE_WORKFLOW';
export const DELETE_WORKFLOW_SUCCESS = 'DELETE_WORKFLOW_SUCCESS';
export const DELETE_WORKFLOW_FAILURE = 'DELETE_WORKFLOW_FAILURE';

export const SWITCH_WORKFLOW_ACTIVE_STATE = 'SWITCH_WORKFLOW_ACTIVE_STATE';
export const SWITCH_WORKFLOW_ACTIVE_STATE_SUCCESS = 'SWITCH_WORKFLOW_ACTIVE_STATE_SUCCESS';
export const SWITCH_WORKFLOW_ACTIVE_STATE_FAILURE = 'SWITCH_WORKFLOW_ACTIVE_STATE_FAILURE';

export const UPDATE_WORKFLOWS_IS_ACTIVE = 'UPDATE_WORKFLOWS_IS_ACTIVE';
export const UPDATE_WORKFLOWS_IS_ACTIVE_SUCCESS = 'UPDATE_WORKFLOWS_IS_ACTIVE_SUCCESS';
export const UPDATE_WORKFLOWS_IS_ACTIVE_FAILURE = 'UPDATE_WORKFLOWS_IS_ACTIVE_FAILURE';

export const CREATE_WORKFLOW = 'CREATE_WORKFLOW';
export const CREATE_WORKFLOW_SUCCESS = 'CREATE_WORKFLOW_SUCCESS';
export const CREATE_WORKFLOW_FAILURE = 'CREATE_WORKFLOW_FAILURE';

export const UPDATE_WORKFLOW = 'UPDATE_WORKFLOW';
export const UPDATE_WORKFLOW_SUCCESS = 'UPDATE_WORKFLOW_SUCCESS';
export const UPDATE_WORKFLOW_FAILURE = 'UPDATE_WORKFLOW_FAILURE';

export const REMOVE_BACKEND_VALIDATION_ERROR = 'REMOVE_BACKEND_VALIDATION_ERROR';

export const SEARCH_WORKFLOWS = 'SEARCH_WORKFLOWS';
export const SEARCH_WORKFLOWS_SUCCESS = 'SEARCH_WORKFLOWS_SUCCESS';
export const SEARCH_WORKFLOWS_FAILURE = 'SEARCH_WORKFLOWS_FAILURE';

export const FILTER_PROJECTS = 'FILTER_PROJECTS';

export const LOAD_JOBS_FOR_RUN = 'LOAD_JOBS_FOR_RUN';
export const LOAD_JOBS_FOR_RUN_SUCCESS = 'LOAD_JOBS_FOR_RUN_SUCCESS';
export const LOAD_JOBS_FOR_RUN_FAILURE = 'LOAD_JOBS_FOR_RUN_FAILURE';
export const RUN_JOBS = 'RUN_JOBS';
export const RUN_JOBS_CANCEL = 'RUN_JOBS_CANCEL';

export const RUN_WORKFLOWS = 'RUN_WORKFLOWS';

export const LOAD_HISTORY_FOR_WORKFLOW = 'LOAD_HISTORY_FOR_WORKFLOW';
export const LOAD_HISTORY_FOR_WORKFLOW_SUCCESS = 'LOAD_HISTORY_FOR_WORKFLOW_SUCCESS';
export const LOAD_HISTORY_FOR_WORKFLOW_FAILURE = 'LOAD_HISTORY_FOR_WORKFLOW_FAILURE';

export const LOAD_WORKFLOWS_FROM_HISTORY = 'LOAD_WORKFLOWS_FROM_HISTORY';
export const LOAD_WORKFLOWS_FROM_HISTORY_SUCCESS = 'LOAD_WORKFLOWS_FROM_HISTORY_SUCCESS';
export const LOAD_WORKFLOWS_FROM_HISTORY_FAILURE = 'LOAD_WORKFLOWS_FROM_HISTORY_FAILURE';

export const EXPORT_WORKFLOWS = 'EXPORT_WORKFLOW';
export const EXPORT_WORKFLOWS_DONE = 'EXPORT_WORKFLOW_DONE';

export const SET_WORKFLOW_FILE = 'SET_WORKFLOW_FILE';
export const IMPORT_WORKFLOW = 'IMPORT_WORKFLOW';
export const IMPORT_WORKFLOW_FAILURE = 'IMPORT_WORKFLOW_FAILURE';

export const IMPORT_WORKFLOWS = 'IMPORT_WORKFLOWS';
export const IMPORT_WORKFLOWS_SUCCESS = 'IMPORT_WORKFLOWS_SUCCESS';
export const IMPORT_WORKFLOWS_FAILURE = 'IMPORT_WORKFLOWS_FAILURE';

export const REVERT_WORKFLOW = 'REVERT_WORKFLOW';
export const REVERT_WORKFLOW_SUCCESS = 'REVERT_WORKFLOW_SUCCESS';
export const REVERT_WORKFLOW_FAILURE = 'REVERT_WORKFLOW_FAILURE';

export const LOAD_INGESTION_STATUS = 'LOAD_INGESTION_STATUS';
export const LOAD_INGESTION_STATUS_SUCCESS = 'LOAD_INGESTION_STATUS_SUCCESS';
export const LOAD_INGESTION_STATUS_FAILURE = 'LOAD_INGESTION_STATUS_FAILURE';

export class InitializeWorkflows implements Action {
  readonly type = INITIALIZE_WORKFLOWS;
}

export class InitializeWorkflowsSuccess implements Action {
  readonly type = INITIALIZE_WORKFLOWS_SUCCESS;
  constructor(
    public payload: {
      projects: ProjectModel[];
      jobTemplates: JobTemplateModel[];
    },
  ) {}
}

export class InitializeWorkflowsFailure implements Action {
  readonly type = INITIALIZE_WORKFLOWS_FAILURE;
}

export class StartWorkflowInitialization implements Action {
  readonly type = START_WORKFLOW_INITIALIZATION;
  constructor(public payload: { id?: number; mode: string }) {}
}

export class SetEmptyWorkflow implements Action {
  readonly type = SET_EMPTY_WORKFLOW;
  constructor(public payload: WorkflowJoinedModel) {}
}

export class LoadWorkflowSuccess implements Action {
  readonly type = LOAD_WORKFLOW_SUCCESS;
  constructor(public payload: WorkflowJoinedModel) {}
}

export class LoadWorkflowFailure implements Action {
  readonly type = LOAD_WORKFLOW_FAILURE;
}

export class LoadWorkflowFailureIncorrectId implements Action {
  readonly type = LOAD_WORKFLOW_FAILURE_INCORRECT_ID;
}

export class WorkflowChanged implements Action {
  readonly type = WORKFLOW_CHANGED;
  constructor(public payload: WorkflowJoinedModel) {}
}

export class WorkflowActionChanged implements Action {
  readonly type = WORKFLOW_ACTION_CHANGED;
  constructor(public payload: WorkflowJoinedModel) {}
}

export class DeleteWorkflow implements Action {
  readonly type = DELETE_WORKFLOW;
  constructor(public payload: number) {}
}

export class DeleteWorkflowSuccess implements Action {
  readonly type = DELETE_WORKFLOW_SUCCESS;
  constructor(public payload: number) {}
}

export class DeleteWorkflowFailure implements Action {
  readonly type = DELETE_WORKFLOW_FAILURE;
}

export class SwitchWorkflowActiveState implements Action {
  readonly type = SWITCH_WORKFLOW_ACTIVE_STATE;
  constructor(public payload: { id: number; currentActiveState: boolean }) {}
}

export class SwitchWorkflowActiveStateSuccess implements Action {
  readonly type = SWITCH_WORKFLOW_ACTIVE_STATE_SUCCESS;
  constructor(public payload: number) {}
}

export class SwitchWorkflowActiveStateFailure implements Action {
  readonly type = SWITCH_WORKFLOW_ACTIVE_STATE_FAILURE;
}

export class UpdateWorkflowsIsActive implements Action {
  readonly type = UPDATE_WORKFLOWS_IS_ACTIVE;
  constructor(public payload: { ids: number[]; isActiveNewValue: boolean }) {}
}

export class UpdateWorkflowsIsActiveSuccess implements Action {
  readonly type = UPDATE_WORKFLOWS_IS_ACTIVE_SUCCESS;
  constructor(public payload: { ids: number[]; isActiveNewValue: boolean }) {}
}

export class UpdateWorkflowsIsActiveFailure implements Action {
  readonly type = UPDATE_WORKFLOWS_IS_ACTIVE_FAILURE;
}

export class CreateWorkflow implements Action {
  readonly type = CREATE_WORKFLOW;
}

export class CreateWorkflowSuccess implements Action {
  readonly type = CREATE_WORKFLOW_SUCCESS;
  constructor(public payload: WorkflowModel) {}
}

export class CreateWorkflowFailure implements Action {
  readonly type = CREATE_WORKFLOW_FAILURE;
  constructor(public payload: string[]) {}
}

export class UpdateWorkflow implements Action {
  readonly type = UPDATE_WORKFLOW;
}

export class UpdateWorkflowSuccess implements Action {
  readonly type = UPDATE_WORKFLOW_SUCCESS;
  constructor(public payload: WorkflowModel) {}
}

export class UpdateWorkflowFailure implements Action {
  readonly type = UPDATE_WORKFLOW_FAILURE;
  constructor(public payload: string[]) {}
}

export class RemoveBackendValidationError implements Action {
  readonly type = REMOVE_BACKEND_VALIDATION_ERROR;
  constructor(public payload: number) {}
}

export class SearchWorkflows implements Action {
  readonly type = SEARCH_WORKFLOWS;
  constructor(public payload: TableSearchRequestModel) {}
}

export class SearchWorkflowsSuccess implements Action {
  readonly type = SEARCH_WORKFLOWS_SUCCESS;
  constructor(public payload: { workflows: WorkflowModel[]; total: number }) {}
}

export class SearchWorkflowsFailure implements Action {
  readonly type = SEARCH_WORKFLOWS_FAILURE;
}

export class FilterProjects implements Action {
  readonly type = FILTER_PROJECTS;
  constructor(public payload: string) {}
}

export class LoadJobsForRun implements Action {
  readonly type = LOAD_JOBS_FOR_RUN;
  constructor(public payload: number) {}
}

export class LoadJobsForRunSuccess implements Action {
  readonly type = LOAD_JOBS_FOR_RUN_SUCCESS;
  constructor(public payload: JobForRunModel[]) {}
}

export class LoadJobsForRunFailure implements Action {
  readonly type = LOAD_JOBS_FOR_RUN_FAILURE;
}

export class RunJobs implements Action {
  readonly type = RUN_JOBS;
  constructor(public payload: { workflowId: number; jobs?: number[] }) {}
}

export class RunJobsCancel implements Action {
  readonly type = RUN_JOBS_CANCEL;
}

export class RunWorkflows implements Action {
  readonly type = RUN_WORKFLOWS;
  constructor(public payload: number[]) {}
}

export class LoadHistoryForWorkflow implements Action {
  readonly type = LOAD_HISTORY_FOR_WORKFLOW;
  constructor(public payload: number) {}
}

export class LoadHistoryForWorkflowSuccess implements Action {
  readonly type = LOAD_HISTORY_FOR_WORKFLOW_SUCCESS;
  constructor(public payload: HistoryModel[]) {}
}

export class LoadHistoryForWorkflowFailure implements Action {
  readonly type = LOAD_HISTORY_FOR_WORKFLOW_FAILURE;
}

export class LoadWorkflowsFromHistory implements Action {
  readonly type = LOAD_WORKFLOWS_FROM_HISTORY;
  constructor(public payload: { leftWorkflowHistoryId: number; rightWorkflowHistoryId: number }) {}
}

export class LoadWorkflowsFromHistorySuccess implements Action {
  readonly type = LOAD_WORKFLOWS_FROM_HISTORY_SUCCESS;
  constructor(
    public payload: {
      leftWorkflowHistory: WorkflowHistoryModel;
      rightWorkflowHistory: WorkflowHistoryModel;
      jobTemplates: JobTemplateModel[];
    },
  ) {}
}

export class LoadWorkflowsFromHistoryFailure implements Action {
  readonly type = LOAD_WORKFLOWS_FROM_HISTORY_FAILURE;
}

export class ExportWorkflows implements Action {
  readonly type = EXPORT_WORKFLOWS;
  constructor(public payload: number[]) {}
}

export class ExportWorkflowsDone implements Action {
  readonly type = EXPORT_WORKFLOWS_DONE;
}

export class SetWorkflowFile implements Action {
  readonly type = SET_WORKFLOW_FILE;
  constructor(public payload: File) {}
}

export class ImportWorkflow implements Action {
  readonly type = IMPORT_WORKFLOW;
}

export class ImportWorkflowFailure implements Action {
  readonly type = IMPORT_WORKFLOW_FAILURE;
}

export class ImportWorkflows implements Action {
  readonly type = IMPORT_WORKFLOWS;
  constructor(public payload: File) {}
}

export class ImportWorkflowsSuccess implements Action {
  readonly type = IMPORT_WORKFLOWS_SUCCESS;
  constructor(public payload: WorkflowModel[]) {}
}

export class ImportWorkflowsFailure implements Action {
  readonly type = IMPORT_WORKFLOWS_FAILURE;
}

export class RevertWorkflow implements Action {
  readonly type = REVERT_WORKFLOW;
  constructor(public payload: number) {}
}

export class RevertWorkflowSuccess implements Action {
  readonly type = REVERT_WORKFLOW_SUCCESS;
  constructor(public payload: WorkflowJoinedModel) {}
}

export class RevertWorkflowFailure implements Action {
  readonly type = REVERT_WORKFLOW_FAILURE;
}

export class LoadIngestionStatus implements Action {
  readonly type = LOAD_INGESTION_STATUS;
  constructor(public payload: number) {}
}

export class LoadIngestionStatusSuccess implements Action {
  readonly type = LOAD_INGESTION_STATUS_SUCCESS;
  constructor(public payload: IngestionStatusModel[]) {}
}

export class LoadIngestionStatusFailure implements Action {
  readonly type = LOAD_INGESTION_STATUS_FAILURE;
}

export type WorkflowsActions =
  | InitializeWorkflows
  | InitializeWorkflowsSuccess
  | InitializeWorkflowsFailure
  | StartWorkflowInitialization
  | SetEmptyWorkflow
  | LoadWorkflowSuccess
  | LoadWorkflowFailure
  | LoadWorkflowFailureIncorrectId
  | WorkflowChanged
  | WorkflowActionChanged
  | DeleteWorkflow
  | DeleteWorkflowSuccess
  | DeleteWorkflowFailure
  | SwitchWorkflowActiveState
  | SwitchWorkflowActiveStateSuccess
  | SwitchWorkflowActiveStateFailure
  | UpdateWorkflowsIsActive
  | UpdateWorkflowsIsActiveSuccess
  | UpdateWorkflowsIsActiveFailure
  | CreateWorkflow
  | CreateWorkflowSuccess
  | CreateWorkflowFailure
  | UpdateWorkflow
  | UpdateWorkflowSuccess
  | UpdateWorkflowFailure
  | RemoveBackendValidationError
  | SearchWorkflows
  | SearchWorkflowsSuccess
  | SearchWorkflowsFailure
  | FilterProjects
  | LoadJobsForRun
  | LoadJobsForRunSuccess
  | LoadJobsForRunFailure
  | RunJobs
  | RunJobsCancel
  | RunWorkflows
  | LoadHistoryForWorkflow
  | LoadHistoryForWorkflowSuccess
  | LoadHistoryForWorkflowFailure
  | LoadWorkflowsFromHistory
  | LoadWorkflowsFromHistorySuccess
  | LoadWorkflowsFromHistoryFailure
  | ExportWorkflows
  | ExportWorkflowsDone
  | SetWorkflowFile
  | ImportWorkflow
  | ImportWorkflowFailure
  | ImportWorkflows
  | ImportWorkflowsSuccess
  | ImportWorkflowsFailure
  | RevertWorkflow
  | RevertWorkflowSuccess
  | RevertWorkflowFailure
  | LoadIngestionStatus
  | LoadIngestionStatusSuccess
  | LoadIngestionStatusFailure;
