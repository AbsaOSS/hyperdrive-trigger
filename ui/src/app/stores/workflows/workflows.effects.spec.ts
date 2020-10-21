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

import { TestBed } from '@angular/core/testing';
import { EMPTY, Observable } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Actions } from '@ngrx/effects';
import { cold } from 'jasmine-marbles';
import { Spy, createSpyFromClass } from 'jasmine-auto-spies';
import * as WorkflowsActions from './workflows.actions';
import {
  CreateWorkflow,
  DeleteWorkflow,
  ExportWorkflows,
  ImportWorkflow,
  InitializeWorkflows,
  LoadHistoryForWorkflow,
  LoadJobsForRun,
  RunJobs,
  StartWorkflowInitialization,
  SwitchWorkflowActiveState,
  UpdateWorkflow,
  UpdateWorkflowsIsActive,
  ImportWorkflows,
} from './workflows.actions';

import { WorkflowsEffects } from './workflows.effects';
import { WorkflowService } from '../../services/workflow/workflow.service';
import { ProjectModelFactory } from '../../models/project.model';
import { WorkflowModel, WorkflowModelFactory } from '../../models/workflow.model';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  DynamicFormPart,
  DynamicFormPartFactory,
  DynamicFormParts,
  DynamicFormPartsFactory,
  FormPartFactory,
  PartValidationFactory,
  WorkflowFormPartsModelFactory,
} from '../../models/workflowFormParts.model';
import {
  workflowFormParts,
  workflowFormParts as workflowFormPartsConsts,
  workflowFormPartsSequences,
} from '../../constants/workflowFormParts.constants';
import { workflowModes } from '../../models/enums/workflowModes.constants';
import { SensorModelFactory, SensorTypeFactory } from '../../models/sensor.model';
import { DagDefinitionJoinedModelFactory } from '../../models/dagDefinitionJoined.model';
import { WorkflowJoinedModelFactory } from '../../models/workflowJoined.model';
import { WorkflowEntryModelFactory } from '../../models/workflowEntry.model';
import { JobDefinitionModelFactory } from '../../models/jobDefinition.model';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { texts } from '../../constants/texts.constants';
import { Router } from '@angular/router';
import { absoluteRoutes } from '../../constants/routes.constants';
import { ApiErrorModel, ApiErrorModelFactory } from '../../models/errors/apiError.model';
import { WorkflowHistoryService } from '../../services/workflowHistory/workflow-history.service';
import { HistoryModel, HistoryModelFactory } from '../../models/historyModel';
import { JobForRunModelFactory } from '../../models/jobForRun.model';
import { JobService } from '../../services/job/job.service';
import { UtilService } from 'src/app/services/util/util.service';
import { BulkOperationErrorModelFactory } from 'src/app/models/errors/bulkOperationError.model';

describe('WorkflowsEffects', () => {
  let underTest: WorkflowsEffects;
  let workflowServiceSpy: Spy<WorkflowService>;
  let workflowHistoryServiceSpy: Spy<WorkflowHistoryService>;
  let jobServiceSpy: Spy<JobService>;
  let mockActions: Observable<any>;
  let mockStore: MockStore;
  let toastrServiceSpy2: Spy<ToastrService>;
  let utilServiceSpy: Spy<UtilService>;
  let routerSpy2: Spy<Router>;

  const initialAppState = {
    workflows: {
      workflowAction: {
        mode: workflowModes.CREATE,
        workflowFormData: {
          details: [{ property: 'detailProp', value: 'detailVal' }],
          sensor: [{ property: 'sensorProp', value: 'sensorVal' }],
          jobs: [{ jobId: 'jobId', order: 0, entries: [{ property: 'jobProp', value: 'jobVal' }] }],
        },
        workflowFormParts: WorkflowFormPartsModelFactory.create(
          workflowFormPartsSequences.allDetails,
          workflowFormPartsConsts.SENSOR.SENSOR_TYPE,
          workflowFormPartsConsts.JOB.JOB_NAME,
          workflowFormPartsConsts.JOB.JOB_TEMPLATE_ID,
          DynamicFormPartsFactory.create([], []),
        ),
        workflowFile: new File(['content'], 'filename.json'),
      },
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WorkflowsEffects,
        { provide: WorkflowService, useValue: createSpyFromClass(WorkflowService) },
        { provide: WorkflowHistoryService, useValue: createSpyFromClass(WorkflowHistoryService) },
        { provide: JobService, useValue: createSpyFromClass(JobService) },
        provideMockActions(() => mockActions),
        provideMockStore({ initialState: initialAppState }),
        { provide: ToastrService, useValue: createSpyFromClass(ToastrService) },
        { provide: UtilService, useValue: createSpyFromClass(UtilService) },
        { provide: Router, useValue: createSpyFromClass(Router) },
      ],
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([]), ToastrModule.forRoot()],
    });
    underTest = TestBed.inject(WorkflowsEffects);
    workflowServiceSpy = TestBed.inject<any>(WorkflowService);
    workflowHistoryServiceSpy = TestBed.inject<any>(WorkflowHistoryService);
    jobServiceSpy = TestBed.inject<any>(JobService);
    mockActions = TestBed.inject(Actions);
    mockStore = TestBed.inject(MockStore);
    toastrServiceSpy2 = TestBed.inject<any>(ToastrService);
    utilServiceSpy = TestBed.inject<any>(UtilService);
    routerSpy2 = TestBed.inject<any>(Router);
  });

  describe('workflowsInitialize', () => {
    it('should return workflows and projects', () => {
      const projects = [
        ProjectModelFactory.create('projectName1', [
          WorkflowModelFactory.create('workflowName1', true, 'projectName1', new Date(Date.now()), new Date(Date.now()), 0),
        ]),
        ProjectModelFactory.create('projectName2', [
          WorkflowModelFactory.create('workflowName2', true, 'projectName2', new Date(Date.now()), new Date(Date.now()), 1),
        ]),
      ];

      const dynamicFormParts = DynamicFormPartsFactory.create(
        [
          DynamicFormPartFactory.create('typeOne', [
            FormPartFactory.create('nameOne', 'propertyOne', 'string-field', PartValidationFactory.create(true)),
          ]),
        ],
        [
          DynamicFormPartFactory.create('typeTwo', [
            FormPartFactory.create('nameTwo', 'propertyTwo', 'string-field', PartValidationFactory.create(true)),
          ]),
        ],
      );

      const workflowFormParts = WorkflowFormPartsModelFactory.create(
        workflowFormPartsSequences.allDetails,
        workflowFormPartsConsts.SENSOR.SENSOR_TYPE,
        workflowFormPartsConsts.JOB.JOB_NAME,
        workflowFormPartsConsts.JOB.JOB_TEMPLATE_ID,
        dynamicFormParts,
      );

      const action = new InitializeWorkflows();
      mockActions = cold('-a', { a: action });
      const getProjectsResponse = cold('-a|', { a: projects });
      const getWorkflowDynamicFormPartsResponse = cold('-a|', { a: dynamicFormParts });

      const expected = cold('---a', {
        a: {
          type: WorkflowsActions.INITIALIZE_WORKFLOWS_SUCCESS,
          payload: { projects: projects, workflowFormParts: workflowFormParts },
        },
      });

      workflowServiceSpy.getProjects.and.returnValue(getProjectsResponse);
      workflowServiceSpy.getWorkflowDynamicFormParts.and.returnValue(getWorkflowDynamicFormPartsResponse);

      expect(underTest.workflowsInitialize).toBeObservable(expected);
    });

    it('should return initialize workflows failure if workflowService.getWorkflowDynamicFormParts responds with an error', () => {
      const projects = [
        ProjectModelFactory.create('projectName1', [
          WorkflowModelFactory.create('workflowName1', true, 'projectName1', new Date(Date.now()), new Date(Date.now()), 0),
        ]),
        ProjectModelFactory.create('projectName2', [
          WorkflowModelFactory.create('workflowName2', true, 'projectName2', new Date(Date.now()), new Date(Date.now()), 1),
        ]),
      ];

      const action = new InitializeWorkflows();
      mockActions = cold('-a', { a: action });
      const getProjectsResponse = cold('-a|', { a: projects });
      const getWorkflowDynamicFormPartsResponse = cold('-#|');

      const expected = cold('---a', {
        a: {
          type: WorkflowsActions.INITIALIZE_WORKFLOWS_FAILURE,
        },
      });

      workflowServiceSpy.getProjects.and.returnValue(getProjectsResponse);
      workflowServiceSpy.getWorkflowDynamicFormParts.and.returnValue(getWorkflowDynamicFormPartsResponse);

      expect(underTest.workflowsInitialize).toBeObservable(expected);
    });
  });

  describe('workflowInitializationStart', () => {
    it('should set empty workflow when workflow mode is create', () => {
      const action = new StartWorkflowInitialization({ mode: workflowModes.CREATE });
      mockActions = cold('a', { a: action });
      const expected = cold('a', {
        a: {
          type: WorkflowsActions.SET_EMPTY_WORKFLOW,
        },
      });

      expect(underTest.workflowInitializationStart).toBeObservable(expected);
    });

    it('should stop and dispatch action when id is not set and mode is not equal to create', () => {
      const action = new StartWorkflowInitialization({ mode: workflowModes.EDIT });
      mockActions = cold('a', { a: action });
      const expected = cold('a', {
        a: {
          type: WorkflowsActions.LOAD_WORKFLOW_FAILURE_INCORRECT_ID,
        },
      });

      expect(underTest.workflowInitializationStart).toBeObservable(expected);
    });

    it('should return load workflow failure if workflowService.getWorkflow responds with an error', () => {
      const action = new StartWorkflowInitialization({ id: 10, mode: workflowModes.EDIT });
      mockActions = cold('-a', { a: action });
      const getWorkflowResponse = cold('-#|');

      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.LOAD_WORKFLOW_FAILURE,
        },
      });

      workflowServiceSpy.getWorkflow.and.returnValue(getWorkflowResponse);

      expect(underTest.workflowInitializationStart).toBeObservable(expected);
    });

    it('should initialize workflow', () => {
      const jobDefinition = JobDefinitionModelFactory.create(10, 'name', '1', undefined, 0, 10);
      const workflow = WorkflowJoinedModelFactory.create(
        'name',
        true,
        'project',
        undefined,
        SensorModelFactory.create(10, SensorTypeFactory.create('name'), undefined, 10),
        DagDefinitionJoinedModelFactory.create(10, [jobDefinition], 10),
        10,
      );

      const action = new StartWorkflowInitialization({ id: 10, mode: workflowModes.EDIT });
      mockActions = cold('-a', { a: action });

      const getWorkflowResponse = cold('-a|', { a: workflow });

      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.LOAD_WORKFLOW_SUCCESS,
          payload: {
            workflow: workflow,
            detailsData: [
              WorkflowEntryModelFactory.create(workflowFormParts.DETAILS.WORKFLOW_NAME.property, workflow.name),
              WorkflowEntryModelFactory.create(workflowFormParts.DETAILS.PROJECT_NAME.property, workflow.project),
              WorkflowEntryModelFactory.create(workflowFormParts.DETAILS.IS_ACTIVE.property, workflow.isActive),
            ],
            sensorData: [WorkflowEntryModelFactory.create(workflowFormParts.SENSOR.SENSOR_TYPE.property, workflow.sensor.sensorType.name)],
            jobsData: [
              jasmine.objectContaining({
                order: 0,
                entries: [
                  WorkflowEntryModelFactory.create(
                    workflowFormParts.JOB.JOB_TEMPLATE_ID.property,
                    workflow.dagDefinitionJoined.jobDefinitions[0].jobTemplateId,
                  ),
                  WorkflowEntryModelFactory.create(
                    workflowFormParts.JOB.JOB_NAME.property,
                    workflow.dagDefinitionJoined.jobDefinitions[0].name,
                  ),
                ],
              }),
            ],
          },
        },
      });

      workflowServiceSpy.getWorkflow.and.returnValue(getWorkflowResponse);

      expect(underTest.workflowInitializationStart).toBeObservable(expected);
    });
  });

  describe('workflowDelete', () => {
    it('should return delete workflow success when service returns success deletion', () => {
      const toastrServiceSpy = toastrServiceSpy2.success;
      const routerSpy = routerSpy2.navigateByUrl;
      const payload = 10;
      const response = true;

      const action = new DeleteWorkflow(payload);
      mockActions = cold('-a', { a: action });

      const deleteWorkflowResponse = cold('-a|', { a: response });
      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.DELETE_WORKFLOW_SUCCESS,
          payload: payload,
        },
      });

      workflowServiceSpy.deleteWorkflow.and.returnValue(deleteWorkflowResponse);

      expect(underTest.workflowDelete).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.DELETE_WORKFLOW_SUCCESS_NOTIFICATION);
      expect(routerSpy).toHaveBeenCalledTimes(1);
      expect(routerSpy).toHaveBeenCalledWith(absoluteRoutes.WORKFLOWS_HOME);
    });

    it('should return delete workflow failure when service fails to delete workflow', () => {
      const toastrServiceSpy = toastrServiceSpy2.error;
      const payload = 10;
      const response = false;

      const action = new DeleteWorkflow(payload);
      mockActions = cold('-a', { a: action });

      const deleteWorkflowResponse = cold('-a|', { a: response });
      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.DELETE_WORKFLOW_FAILURE,
        },
      });

      workflowServiceSpy.deleteWorkflow.and.returnValue(deleteWorkflowResponse);

      expect(underTest.workflowDelete).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.DELETE_WORKFLOW_FAILURE_NOTIFICATION);
    });

    it('should return delete workflow failure when service throws exception while deleting workflow', () => {
      const toastrServiceSpy = toastrServiceSpy2.error;
      const payload = 10;
      const action = new DeleteWorkflow(payload);
      mockActions = cold('-a', { a: action });

      const errorResponse = cold('-#|');
      workflowServiceSpy.deleteWorkflow.and.returnValue(errorResponse);

      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.DELETE_WORKFLOW_FAILURE,
        },
      });
      expect(underTest.workflowDelete).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.DELETE_WORKFLOW_FAILURE_NOTIFICATION);
    });
  });

  describe('workflowActiveStateSwitch', () => {
    it('should switch workflow active state when service successfully switches state', () => {
      const toastrServiceSpy = toastrServiceSpy2.success;
      const payload = { id: 10, currentActiveState: true };
      const response = true;

      const action = new SwitchWorkflowActiveState(payload);
      mockActions = cold('-a', { a: action });

      const switchWorkflowActiveStateResponse = cold('-a|', { a: response });
      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.SWITCH_WORKFLOW_ACTIVE_STATE_SUCCESS,
          payload: payload.id,
        },
      });

      workflowServiceSpy.switchWorkflowActiveState.and.returnValue(switchWorkflowActiveStateResponse);

      expect(underTest.workflowActiveStateSwitch).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.SWITCH_WORKFLOW_ACTIVE_STATE_SUCCESS_NOTIFICATION(payload.currentActiveState));
    });

    it('should not switch workflow active state when service fails to switches state', () => {
      const toastrServiceSpy = toastrServiceSpy2.error;
      const payload = { id: 10, currentActiveState: true };
      const response = false;

      const action = new SwitchWorkflowActiveState(payload);
      mockActions = cold('-a', { a: action });

      const switchWorkflowActiveStateResponse = cold('-a|', { a: response });
      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.SWITCH_WORKFLOW_ACTIVE_STATE_FAILURE,
        },
      });

      workflowServiceSpy.switchWorkflowActiveState.and.returnValue(switchWorkflowActiveStateResponse);

      expect(underTest.workflowActiveStateSwitch).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.SWITCH_WORKFLOW_ACTIVE_STATE_FAILURE_NOTIFICATION);
    });

    it('should not switch workflow active state when service throws exception while switching active state', () => {
      const toastrServiceSpy = toastrServiceSpy2.error;
      const payload = { id: 10, currentActiveState: true };
      const action = new SwitchWorkflowActiveState(payload);
      mockActions = cold('-a', { a: action });

      const errorResponse = cold('-#|');
      workflowServiceSpy.switchWorkflowActiveState.and.returnValue(errorResponse);

      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.SWITCH_WORKFLOW_ACTIVE_STATE_FAILURE,
        },
      });
      expect(underTest.workflowActiveStateSwitch).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.SWITCH_WORKFLOW_ACTIVE_STATE_FAILURE_NOTIFICATION);
    });
  });

  describe('updateWorkflowsIsActive', () => {
    it('should dispatch success action when service successfully updates isActive', () => {
      const toastrServiceSpy = toastrServiceSpy2.success;
      const payload = { ids: [21, 22], isActiveNewValue: true };
      const response = true;

      const action = new UpdateWorkflowsIsActive(payload);
      mockActions = cold('-a', { a: action });

      const updateWorkflowsIsActiveResponse = cold('-a|', { a: response });
      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.UPDATE_WORKFLOWS_IS_ACTIVE_SUCCESS,
          payload: payload,
        },
      });

      workflowServiceSpy.updateWorkflowsIsActive.and.returnValue(updateWorkflowsIsActiveResponse);

      expect(underTest.updateWorkflowsIsActive).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.UPDATE_WORKFLOWS_IS_ACTIVE_SUCCESS_NOTIFICATION(payload.isActiveNewValue));
    });

    it('should dispatch failure action when service fails to update isActive', () => {
      const toastrServiceSpy = toastrServiceSpy2.error;
      const payload = { ids: [21, 22], isActiveNewValue: true };
      const response = false;

      const action = new UpdateWorkflowsIsActive(payload);
      mockActions = cold('-a', { a: action });

      const updateWorkflowsIsActiveResponse = cold('-a|', { a: response });
      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.UPDATE_WORKFLOWS_IS_ACTIVE_FAILURE,
        },
      });

      workflowServiceSpy.updateWorkflowsIsActive.and.returnValue(updateWorkflowsIsActiveResponse);

      expect(underTest.updateWorkflowsIsActive).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.UPDATE_WORKFLOWS_IS_ACTIVE_FAILURE_NOTIFICATION);
    });

    it('should dispatch failure action when service throws exception while updating isActive', () => {
      const toastrServiceSpy = toastrServiceSpy2.error;
      const payload = { ids: [21, 22], isActiveNewValue: true };
      const action = new UpdateWorkflowsIsActive(payload);
      mockActions = cold('-a', { a: action });

      const errorResponse = cold('-#|');
      workflowServiceSpy.updateWorkflowsIsActive.and.returnValue(errorResponse);

      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.UPDATE_WORKFLOWS_IS_ACTIVE_FAILURE,
        },
      });
      expect(underTest.updateWorkflowsIsActive).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.UPDATE_WORKFLOWS_IS_ACTIVE_FAILURE_NOTIFICATION);
    });
  });

  describe('workflowCreate', () => {
    it('should return create workflow failure with no backend validation errors when service fails to create workflow', () => {
      const toastrServiceSpy = toastrServiceSpy2.error;

      const action = new CreateWorkflow();
      mockActions = cold('-a', { a: action });
      const createWorkflowResponse = cold('-#|', null, 'notValidationError');

      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.CREATE_WORKFLOW_FAILURE,
          payload: [],
        },
      });

      workflowServiceSpy.createWorkflow.and.returnValue(createWorkflowResponse);

      expect(underTest.workflowCreate).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.CREATE_WORKFLOW_FAILURE_NOTIFICATION);
    });

    it('should return create workflow failure with backend validation errors when service fails to create workflow', () => {
      const toastrServiceSpy = toastrServiceSpy2.error;
      const error = ApiErrorModelFactory.create('error', { name: 'validationError' });

      const action = new CreateWorkflow();
      mockActions = cold('-a', { a: action });
      const createWorkflowResponse = cold('-#|', null, [error]);

      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.CREATE_WORKFLOW_FAILURE,
          payload: [error.message],
        },
      });

      workflowServiceSpy.createWorkflow.and.returnValue(createWorkflowResponse);

      expect(underTest.workflowCreate).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(0);
    });

    it('should return create workflow success when service returns success creation', () => {
      const toastrServiceSpy = toastrServiceSpy2.success;
      const routerSpy = routerSpy2.navigateByUrl;

      const workflow = WorkflowJoinedModelFactory.create(
        'name',
        true,
        'project',
        undefined,
        SensorModelFactory.create(10, SensorTypeFactory.create('name'), undefined, 10),
        DagDefinitionJoinedModelFactory.create(10, [JobDefinitionModelFactory.create(10, 'name', '1', undefined, 0, 10)], 10),
        10,
      );
      const createWorkflowSuccessPayload: WorkflowModel = WorkflowModelFactory.create(
        workflow.name,
        workflow.isActive,
        workflow.project,
        workflow.created,
        workflow.updated,
        workflow.id,
      );

      const action = new CreateWorkflow();
      mockActions = cold('-a', { a: action });

      const createWorkflowResponse = cold('-a|', { a: workflow });

      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.CREATE_WORKFLOW_SUCCESS,
          payload: createWorkflowSuccessPayload,
        },
      });

      workflowServiceSpy.createWorkflow.and.returnValue(createWorkflowResponse);

      expect(underTest.workflowCreate).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.CREATE_WORKFLOW_SUCCESS_NOTIFICATION);
      expect(routerSpy).toHaveBeenCalledTimes(1);
      expect(routerSpy).toHaveBeenCalledWith(absoluteRoutes.SHOW_WORKFLOW + '/' + workflow.id);
    });
  });

  describe('workflowUpdate', () => {
    it('should return update workflow failure with no backend validation errors when service fails to update workflow', () => {
      const toastrServiceSpy = toastrServiceSpy2.error;

      const action = new UpdateWorkflow();
      mockActions = cold('-a', { a: action });
      const updateWorkflowResponse = cold('-#|', null, 'notWorkflowValidation');

      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.UPDATE_WORKFLOW_FAILURE,
          payload: [],
        },
      });

      workflowServiceSpy.updateWorkflow.and.returnValue(updateWorkflowResponse);

      expect(underTest.workflowUpdate).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.UPDATE_WORKFLOW_FAILURE_NOTIFICATION);
    });

    it('should return update workflow failure with backend validation errors when service fails to update workflow', () => {
      const toastrServiceSpy = toastrServiceSpy2.error;
      const error = ApiErrorModelFactory.create('error', { name: 'validationError' });
      const action = new UpdateWorkflow();
      mockActions = cold('-a', { a: action });
      const updateWorkflowResponse = cold('-#|', null, [error]);

      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.UPDATE_WORKFLOW_FAILURE,
          payload: [error.message],
        },
      });

      workflowServiceSpy.updateWorkflow.and.returnValue(updateWorkflowResponse);

      expect(underTest.workflowUpdate).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(0);
    });

    it('should return create workflow success when service returns success creation', () => {
      const toastrServiceSpy = toastrServiceSpy2.success;
      const routerSpy = routerSpy2.navigateByUrl;

      const workflow = WorkflowJoinedModelFactory.create(
        'name',
        true,
        'project',
        undefined,
        SensorModelFactory.create(10, SensorTypeFactory.create('name'), undefined, 10),
        DagDefinitionJoinedModelFactory.create(10, [JobDefinitionModelFactory.create(10, 'name', '1', undefined, 0, 10)], 10),
        10,
      );
      const updateWorkflowSuccessPayload: WorkflowModel = WorkflowModelFactory.create(
        workflow.name,
        workflow.isActive,
        workflow.project,
        workflow.created,
        workflow.updated,
        workflow.id,
      );

      const action = new UpdateWorkflow();
      mockActions = cold('-a', { a: action });

      const updateWorkflowResponse = cold('-a|', { a: workflow });

      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.UPDATE_WORKFLOW_SUCCESS,
          payload: updateWorkflowSuccessPayload,
        },
      });

      workflowServiceSpy.updateWorkflow.and.returnValue(updateWorkflowResponse);

      expect(underTest.workflowUpdate).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.UPDATE_WORKFLOW_SUCCESS_NOTIFICATION);
      expect(routerSpy).toHaveBeenCalledTimes(1);
      expect(routerSpy).toHaveBeenCalledWith(absoluteRoutes.SHOW_WORKFLOW + '/' + workflow.id);
    });
  });

  describe('historyForWorkflowLoad', () => {
    it('should successfully load history for workflow', () => {
      const payload = 42;
      const response: HistoryModel[] = [HistoryModelFactory.create(1, new Date(Date.now()), 'userName', { name: 'operation' })];

      const action = new LoadHistoryForWorkflow(payload);
      mockActions = cold('-a', { a: action });

      const getHistoryForWorkflowResponse = cold('-a|', { a: response });
      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.LOAD_HISTORY_FOR_WORKFLOW_SUCCESS,
          payload: response,
        },
      });

      workflowHistoryServiceSpy.getHistoryForWorkflow.and.returnValue(getHistoryForWorkflowResponse);

      expect(underTest.historyForWorkflowLoad).toBeObservable(expected);
    });

    it('should display failure when service fails to load history for workflow', () => {
      const toastrServiceSpy = toastrServiceSpy2.error;
      const payload = 42;

      const action = new LoadHistoryForWorkflow(payload);
      mockActions = cold('-a', { a: action });

      const getHistoryForWorkflowResponse = cold('-#|');
      workflowHistoryServiceSpy.getHistoryForWorkflow.and.returnValue(getHistoryForWorkflowResponse);

      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.LOAD_HISTORY_FOR_WORKFLOW_FAILURE,
        },
      });
      expect(underTest.historyForWorkflowLoad).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.LOAD_HISTORY_FOR_WORKFLOW_FAILURE_NOTIFICATION);
    });
  });

  describe('workflowsFromHistoryLoad', () => {
    it('should load workflows from history', () => {
      //TODO: Implement test. I need help from you guys. (Problem could be how we combine multiple observables in effects)
    });

    it('should display failure when service fails to load workflows from history', () => {
      //TODO: Implement test. I need help from you guys. (Problem could be how we combine multiple observables in effects)
    });
  });

  describe('getWorkflowFormParts', () => {
    it('should return workflow form parts', () => {
      const sensorDynamicPart: DynamicFormPart = DynamicFormPartFactory.create('sensorDynamicPart', [
        FormPartFactory.create('name1', 'property1', 'type1', PartValidationFactory.create(true)),
      ]);
      const jobDynamicParts: DynamicFormPart = DynamicFormPartFactory.create('jobDynamicPart', [
        FormPartFactory.create('name2', 'property2', 'type2', PartValidationFactory.create(true)),
      ]);
      const dynamicFormParts: DynamicFormParts = DynamicFormPartsFactory.create([sensorDynamicPart], [jobDynamicParts]);

      const result = underTest.getWorkflowFormParts(dynamicFormParts);
      expect(result).toBeDefined();
      expect(result.dynamicParts).toBe(dynamicFormParts);
      expect(result.detailsParts).toBe(workflowFormPartsSequences.allDetails);
      expect(result.sensorSwitchPart).toBe(workflowFormPartsConsts.SENSOR.SENSOR_TYPE);
      expect(result.staticJobPart).toBe(workflowFormPartsConsts.JOB.JOB_NAME);
      expect(result.jobSwitchPart).toBe(workflowFormPartsConsts.JOB.JOB_TEMPLATE_ID);
    });
  });

  describe('isApiError', () => {
    it('should return false if string is passed', () => {
      const errorResponse = 'errorResponse';
      expect(underTest.isApiError(errorResponse)).toBeFalsy();
    });

    it('should return false if wrong object is passed', () => {
      const errorResponse: Record<string, any> = { fieldOne: 'fieldOne', fieldTwo: true, fieldThree: { nestedField: 99 } };
      expect(underTest.isApiError(errorResponse)).toBeFalsy();
    });

    it('should return false if array with wrong object is passed', () => {
      const errorResponse: Array<any> = [{ fieldOne: 'fieldOne', fieldTwo: true, fieldThree: { nestedField: 99 } }];
      expect(underTest.isApiError(errorResponse)).toBeFalsy();
    });

    it('should return true if array with any error type is passed', () => {
      const errorResponse: ApiErrorModel[] = [
        ApiErrorModelFactory.create('message1', { name: 'validationError' }),
        ApiErrorModelFactory.create('message2', { name: 'someError' }),
      ];
      expect(underTest.isApiError(errorResponse)).toBeTruthy();
    });
  });

  describe('isBackendValidationError', () => {
    it('should return false if string is passed', () => {
      const errorResponse = 'errorResponse';
      expect(underTest.isBackendValidationError(errorResponse)).toBeFalsy();
    });

    it('should return false if correct object array is passed with incorrect error type', () => {
      const errorResponse: ApiErrorModel[] = [
        ApiErrorModelFactory.create('message1', { name: 'validationError' }),
        ApiErrorModelFactory.create('message2', { name: 'wrongName' }),
      ];
      expect(underTest.isBackendValidationError(errorResponse)).toBeFalsy();
    });

    it('should return true if array with validation error is passed', () => {
      const errorResponse: ApiErrorModel[] = [
        ApiErrorModelFactory.create('message1', { name: 'validationError' }),
        ApiErrorModelFactory.create('message2', { name: 'validationError' }),
      ];
      expect(underTest.isBackendValidationError(errorResponse)).toBeTruthy();
    });
  });

  describe('jobsForRunLoad', () => {
    it('should successfully load workflows jobs for run', () => {
      const response = [JobForRunModelFactory.create('name', 1, 1)];
      const payload = 42;

      const action = new LoadJobsForRun(payload);
      mockActions = cold('-a', { a: action });

      const getJobsForRunResponse = cold('-a|', { a: response });
      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.LOAD_JOBS_FOR_RUN_SUCCESS,
          payload: response,
        },
      });

      jobServiceSpy.getJobsForRun.and.returnValue(getJobsForRunResponse);

      expect(underTest.jobsForRunLoad).toBeObservable(expected);
    });

    it('should dispatch failure when service throws an exception while loading workflows jobs', () => {
      const toastrServiceSpy = toastrServiceSpy2.error;
      const payload = 42;

      const action = new LoadJobsForRun(payload);
      mockActions = cold('-a', { a: action });

      const getJobsForRunResponse = cold('-#|');
      jobServiceSpy.getJobsForRun.and.returnValue(getJobsForRunResponse);

      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.LOAD_JOBS_FOR_RUN_FAILURE,
        },
      });
      expect(underTest.jobsForRunLoad).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.LOAD_JOBS_FOR_RUN_FAILURE_NOTIFICATION);
    });
  });

  describe('jobsRun', () => {
    it('should display success when service successfully runs workflows jobs', () => {
      const toastrServiceSpy = toastrServiceSpy2.success;
      const workflowId = 42;
      const jobIds = [1, 2, 3];
      const response = true;

      const action = new RunJobs({ workflowId: workflowId, jobs: jobIds });
      mockActions = cold('-a', { a: action });

      const runWorkflowJobsResponse = cold('-a|', { a: response });
      const expected = cold('--a', {
        a: {
          type: EMPTY,
        },
      });

      workflowServiceSpy.runWorkflowJobs.and.returnValue(runWorkflowJobsResponse);

      expect(underTest.jobsRun).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.RUN_WORKFLOWS_JOBS_SUCCESS_NOTIFICATION);
    });

    it('display failure when service fails to run workflow jobs', () => {
      const toastrServiceSpy = toastrServiceSpy2.error;
      const workflowId = 42;
      const jobIds = [1, 2, 3];
      const response = false;

      const action = new RunJobs({ workflowId: workflowId, jobs: jobIds });
      mockActions = cold('-a', { a: action });

      const runWorkflowJobsResponse = cold('-a|', { a: response });
      const expected = cold('--a', {
        a: {
          type: EMPTY,
        },
      });

      workflowServiceSpy.runWorkflowJobs.and.returnValue(runWorkflowJobsResponse);

      expect(underTest.jobsRun).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.RUN_WORKFLOWS_JOBS_FAILURE_NOTIFICATION);
    });

    it('should display failure when service throws an exception while running workflows jobs', () => {
      const toastrServiceSpy = toastrServiceSpy2.error;
      const workflowId = 42;
      const jobIds = [1, 2, 3];

      const action = new RunJobs({ workflowId: workflowId, jobs: jobIds });
      mockActions = cold('-a', { a: action });

      const runWorkflowJobsResponse = cold('-#|');
      workflowServiceSpy.runWorkflowJobs.and.returnValue(runWorkflowJobsResponse);

      const expected = cold('--a', {
        a: {
          type: EMPTY,
        },
      });
      expect(underTest.jobsRun).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.RUN_WORKFLOWS_JOBS_FAILURE_NOTIFICATION);
    });
  });

  describe('workflowExport', () => {
    it('should display success when service successfully exports workflow', () => {
      const toastrServiceSpy = toastrServiceSpy2.success;
      const aSpy = jasmine.createSpyObj('a', ['click', 'remove']);
      spyOn(document, 'createElement').and.returnValue(aSpy);

      const workflowId = 42;
      const blob = new Blob(['hello', ' ', 'world'], { type: 'text/plain' });
      const response = { blob: blob, fileName: 'fileName' };

      const action = new ExportWorkflows([workflowId]);
      mockActions = cold('-a', { a: action });

      const exportWorkflowResponse = cold('-a|', { a: response });
      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.EXPORT_WORKFLOWS_DONE,
        },
      });

      workflowServiceSpy.exportWorkflows.and.returnValue(exportWorkflowResponse);

      expect(underTest.workflowExport).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.EXPORT_WORKFLOWS_SUCCESS_NOTIFICATION);
      expect(aSpy.click).toHaveBeenCalledTimes(1);
      expect(aSpy.click).toHaveBeenCalledWith();
      expect(aSpy.remove).toHaveBeenCalledTimes(1);
      expect(aSpy.remove).toHaveBeenCalledWith();
    });

    it('should display failure when service throws an exception while exporting workflow', () => {
      const toastrServiceSpy = toastrServiceSpy2.error;
      const workflowId = 42;

      const action = new ExportWorkflows([workflowId]);
      mockActions = cold('-a', { a: action });

      const exportWorkflowResponse = cold('-#|');
      workflowServiceSpy.exportWorkflows.and.returnValue(exportWorkflowResponse);

      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.EXPORT_WORKFLOWS_DONE,
        },
      });
      expect(underTest.workflowExport).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.EXPORT_WORKFLOWS_FAILURE_NOTIFICATION);
    });
  });

  describe('workflowImport', () => {
    it('should import workflow', () => {
      const toastrServiceSpy = toastrServiceSpy2.success;

      const jobDefinition = JobDefinitionModelFactory.create(10, 'name', '1', undefined, 0, 10);
      const workflow = WorkflowJoinedModelFactory.create(
        'name',
        true,
        'project',
        undefined,
        SensorModelFactory.create(10, SensorTypeFactory.create('name'), undefined, 10),
        DagDefinitionJoinedModelFactory.create(10, [jobDefinition], 10),
        10,
      );

      const action = new ImportWorkflow();
      mockActions = cold('-a', { a: action });

      const importWorkflowResponse = cold('-a|', { a: workflow });

      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.LOAD_WORKFLOW_SUCCESS,
          payload: {
            workflow: workflow,
            detailsData: [
              WorkflowEntryModelFactory.create(workflowFormParts.DETAILS.WORKFLOW_NAME.property, workflow.name),
              WorkflowEntryModelFactory.create(workflowFormParts.DETAILS.PROJECT_NAME.property, workflow.project),
              WorkflowEntryModelFactory.create(workflowFormParts.DETAILS.IS_ACTIVE.property, workflow.isActive),
            ],
            sensorData: [WorkflowEntryModelFactory.create(workflowFormParts.SENSOR.SENSOR_TYPE.property, workflow.sensor.sensorType.name)],
            jobsData: [
              jasmine.objectContaining({
                order: 0,
                entries: [
                  WorkflowEntryModelFactory.create(
                    workflowFormParts.JOB.JOB_TEMPLATE_ID.property,
                    workflow.dagDefinitionJoined.jobDefinitions[0].jobTemplateId,
                  ),
                  WorkflowEntryModelFactory.create(
                    workflowFormParts.JOB.JOB_NAME.property,
                    workflow.dagDefinitionJoined.jobDefinitions[0].name,
                  ),
                ],
              }),
            ],
          },
        },
      });

      workflowServiceSpy.importWorkflow.and.returnValue(importWorkflowResponse);

      expect(underTest.workflowImport).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.IMPORT_WORKFLOW_SUCCESS_NOTIFICATION);
    });

    it('should display failure when service throws an exception while importing workflow', () => {
      const toastrServiceSpy = toastrServiceSpy2.error;
      const routerSpy = routerSpy2.navigateByUrl;

      const action = new ImportWorkflow();
      mockActions = cold('-a', { a: action });

      const importWorkflowResponse = cold('-#|');
      workflowServiceSpy.importWorkflow.and.returnValue(importWorkflowResponse);

      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.IMPORT_WORKFLOW_FAILURE,
        },
      });
      expect(underTest.workflowImport).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.IMPORT_WORKFLOW_FAILURE_NOTIFICATION);
      expect(routerSpy).toHaveBeenCalledTimes(1);
      expect(routerSpy).toHaveBeenCalledWith(absoluteRoutes.WORKFLOWS);
    });

    it('should return import workflow failure when workflow file is not defined', () => {
      mockStore.setState({
        ...initialAppState,
        workflows: { ...initialAppState.workflows, workflowAction: { ...initialAppState.workflows.workflowAction, workflowFile: null } },
      });
      const toastrServiceSpy = toastrServiceSpy2.error;
      const routerSpy = routerSpy2.navigateByUrl;

      const action = new ImportWorkflow();
      mockActions = cold('a', { a: action });
      const expected = cold('a', {
        a: {
          type: WorkflowsActions.IMPORT_WORKFLOW_FAILURE,
        },
      });

      expect(underTest.workflowImport).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.IMPORT_WORKFLOW_FAILURE_NOTIFICATION);
      expect(routerSpy).toHaveBeenCalledTimes(1);
      expect(routerSpy).toHaveBeenCalledWith(absoluteRoutes.WORKFLOWS);
    });
  });

  describe('workflowsImport', () => {
    it('should import multiple workflows', () => {
      const toastrServiceSpy = toastrServiceSpy2.success;
      const w1 = WorkflowModelFactory.create('w1', true, 'p1', new Date(Date.now()), new Date(Date.now()), 1);
      const w2 = WorkflowModelFactory.create('w2', true, 'p1', new Date(Date.now()), new Date(Date.now()), 2);
      const w3 = WorkflowModelFactory.create('w3', true, 'p2', new Date(Date.now()), new Date(Date.now()), 3);
      const projects = [ProjectModelFactory.create('p1', [w1, w2]), ProjectModelFactory.create('p2', [w3])];

      const file: File = new File(['content'], 'workflows.zip');
      const action = new ImportWorkflows(file);
      mockActions = cold('-a', { a: action });

      const importWorkflowResponse = cold('-a|', { a: projects });

      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.IMPORT_WORKFLOWS_SUCCESS,
          payload: projects,
        },
      });

      workflowServiceSpy.importWorkflows.and.returnValue(importWorkflowResponse);

      expect(underTest.workflowsImport).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.IMPORT_WORKFLOWS_SUCCESS_NOTIFICATION);
    });

    it('should display failure when service throws an exception while importing workflow', () => {
      const toastrServiceSpy = toastrServiceSpy2.error;
      const file: File = new File(['content'], 'workflows.zip');

      const action = new ImportWorkflows(file);
      mockActions = cold('-a', { a: action });

      const importWorkflowResponse = cold('-#|');
      workflowServiceSpy.importWorkflows.and.returnValue(importWorkflowResponse);

      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.IMPORT_WORKFLOWS_FAILURE,
        },
      });
      expect(underTest.workflowsImport).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.IMPORT_WORKFLOWS_FAILURE_NOTIFICATION);
    });

    it('should display bulk operation errors grouped by workflow', () => {
      const toastrServiceSpy = toastrServiceSpy2.error;
      const utilServiceGenerateBulkErrorMessage = utilServiceSpy.generateBulkErrorMessage.and.returnValue('sometext');
      const file: File = new File(['content'], 'workflows.zip');

      const action = new ImportWorkflows(file);
      mockActions = cold('-a', { a: action });

      const errorResponse = [
        BulkOperationErrorModelFactory.create('workflow1', ApiErrorModelFactory.create('message11', { name: 'wrongName' })),
        BulkOperationErrorModelFactory.create('workflow2', ApiErrorModelFactory.create('message21', { name: 'wrongName' })),
        BulkOperationErrorModelFactory.create('workflow1', ApiErrorModelFactory.create('message12', { name: 'wrongName' })),
        BulkOperationErrorModelFactory.create('workflow2', ApiErrorModelFactory.create('message22', { name: 'wrongName' })),
      ];
      const importWorkflowResponse = cold('-#|', null, errorResponse);
      workflowServiceSpy.importWorkflows.and.returnValue(importWorkflowResponse);

      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.IMPORT_WORKFLOWS_FAILURE,
        },
      });
      expect(underTest.workflowsImport).toBeObservable(expected);
      const expectedErrorMessagesGroup = {
        workflow1: ['message11', 'message12'],
        workflow2: ['message21', 'message22'],
      };
      expect(utilServiceGenerateBulkErrorMessage).toHaveBeenCalledWith(expectedErrorMessagesGroup);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith('sometext', texts.IMPORT_WORKFLOWS_BULK_FAILURE_TITLE, jasmine.anything());
    });
  });
});
