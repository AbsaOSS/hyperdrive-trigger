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
import { WorkflowFormPartsModel } from '../../models/workflowFormParts.model';
import { WorkflowEntryModel } from '../../models/workflowEntry.model';
import { JobEntryModel } from '../../models/jobEntry.model';
import { WorkflowModel } from '../../models/workflow.model';
import { SortAttributesModel } from '../../models/search/sortAttributes.model';
import { HistoryModel } from '../../models/historyModel';
import { WorkflowFormDataModel } from '../../models/workflowFormData.model';
import { JobForRunModel } from '../../models/jobForRun.model';

export const INITIALIZE_WORKFLOWS = 'INITIALIZE_WORKFLOWS';
export const INITIALIZE_WORKFLOWS_SUCCESS = 'INITIALIZE_WORKFLOWS_SUCCESS';
export const INITIALIZE_WORKFLOWS_FAILURE = 'INITIALIZE_WORKFLOWS_FAILURE';

export const START_WORKFLOW_INITIALIZATION = 'START_WORKFLOW_INITIALIZATION';
export const SET_EMPTY_WORKFLOW = 'SET_EMPTY_WORKFLOW';
export const LOAD_WORKFLOW_SUCCESS = 'LOAD_WORKFLOW_SUCCESS';
export const LOAD_WORKFLOW_FAILURE_INCORRECT_ID = 'LOAD_WORKFLOW_FAILURE_INCORRECT_ID';
export const LOAD_WORKFLOW_FAILURE = 'LOAD_WORKFLOW_FAILURE';

export const WORKFLOW_ACTION_CHANGED = 'WORKFLOW_ACTION_CHANGED';
export const WORKFLOW_DETAILS_CHANGED = 'WORKFLOW_DETAILS_CHANGED';
export const WORKFLOW_SENSOR_CHANGED = 'WORKFLOW_SENSOR_CHANGED';
export const WORKFLOW_SENSOR_TYPE_SWITCHED = 'WORKFLOW_SENSOR_TYPE_SWITCHED';
export const WORKFLOW_ADD_EMPTY_JOB = 'WORKFLOW_ADD_EMPTY_JOB';
export const WORKFLOW_REMOVE_JOB = 'WORKFLOW_REMOVE_JOB';
export const WORKFLOW_COPY_JOB = 'WORKFLOW_COPY_JOB';
export const WORKFLOW_JOB_CHANGED = 'WORKFLOW_JOB_CHANGED';
export const WORKFLOW_JOB_TYPE_SWITCHED = 'WORKFLOW_JOB_TYPE_SWITCHED';
export const WORKFLOW_JOBS_REORDER = 'WORKFLOW_JOBS_REORDER';

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

export const SET_WORKFLOWS_SORT = 'SET_WORKFLOWS_SORT';
export const SET_WORKFLOWS_FILTERS = 'SET_WORKFLOWS_FILTERS';

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

export class InitializeWorkflows implements Action {
  readonly type = INITIALIZE_WORKFLOWS;
}

export class InitializeWorkflowsSuccess implements Action {
  readonly type = INITIALIZE_WORKFLOWS_SUCCESS;
  constructor(public payload: { projects: ProjectModel[]; workflowFormParts: WorkflowFormPartsModel }) {}
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
}

export class LoadWorkflowSuccess implements Action {
  readonly type = LOAD_WORKFLOW_SUCCESS;
  constructor(
    public payload: {
      workflow: WorkflowJoinedModel;
      detailsData: WorkflowEntryModel[];
      sensorData: WorkflowEntryModel[];
      jobsData: JobEntryModel[];
    },
  ) {}
}

export class LoadWorkflowFailure implements Action {
  readonly type = LOAD_WORKFLOW_FAILURE;
}

export class LoadWorkflowFailureIncorrectId implements Action {
  readonly type = LOAD_WORKFLOW_FAILURE_INCORRECT_ID;
}

export class WorkflowActionChanged implements Action {
  readonly type = WORKFLOW_ACTION_CHANGED;
  constructor(public payload: WorkflowJoinedModel) {}
}

export class WorkflowDetailsChanged implements Action {
  readonly type = WORKFLOW_DETAILS_CHANGED;
  constructor(public payload: WorkflowEntryModel) {}
}

export class WorkflowSensorChanged implements Action {
  readonly type = WORKFLOW_SENSOR_CHANGED;
  constructor(public payload: WorkflowEntryModel) {}
}

export class WorkflowSensorTypeSwitched implements Action {
  readonly type = WORKFLOW_SENSOR_TYPE_SWITCHED;
  constructor(public payload: WorkflowEntryModel) {}
}

export class WorkflowAddEmptyJob implements Action {
  readonly type = WORKFLOW_ADD_EMPTY_JOB;
  constructor(public payload: number) {}
}

export class WorkflowRemoveJob implements Action {
  readonly type = WORKFLOW_REMOVE_JOB;
  constructor(public payload: string) {}
}

export class WorkflowCopyJob implements Action {
  readonly type = WORKFLOW_COPY_JOB;
  constructor(public payload: string) {}
}

export class WorkflowJobChanged implements Action {
  readonly type = WORKFLOW_JOB_CHANGED;
  constructor(public payload: { jobId: string; jobEntry: WorkflowEntryModel }) {}
}

export class WorkflowJobTypeSwitched implements Action {
  readonly type = WORKFLOW_JOB_TYPE_SWITCHED;
  constructor(public payload: { jobId: string; jobEntry: WorkflowEntryModel }) {}
}

export class WorkflowJobsReorder implements Action {
  readonly type = WORKFLOW_JOBS_REORDER;
  constructor(public payload: { initialJobPosition: number; updatedJobPosition: number }) {}
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

export class SetWorkflowsSort implements Action {
  readonly type = SET_WORKFLOWS_SORT;
  constructor(public payload: SortAttributesModel) {}
}

export class SetWorkflowsFilters implements Action {
  readonly type = SET_WORKFLOWS_FILTERS;
  constructor(public payload: any[]) {}
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
      workflowFormParts: WorkflowFormPartsModel;
      leftWorkflowHistoryData: WorkflowFormDataModel;
      leftWorkflowHistory: HistoryModel;
      rightWorkflowHistoryData: WorkflowFormDataModel;
      rightWorkflowHistory: HistoryModel;
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
  constructor(public payload: ProjectModel[]) {}
}

export class ImportWorkflowsFailure implements Action {
  readonly type = IMPORT_WORKFLOWS_FAILURE;
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
  | WorkflowActionChanged
  | WorkflowDetailsChanged
  | WorkflowSensorChanged
  | WorkflowSensorTypeSwitched
  | WorkflowAddEmptyJob
  | WorkflowRemoveJob
  | WorkflowCopyJob
  | WorkflowJobChanged
  | WorkflowJobTypeSwitched
  | WorkflowJobsReorder
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
  | SetWorkflowsSort
  | SetWorkflowsFilters
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
  | ImportWorkflowsFailure;
