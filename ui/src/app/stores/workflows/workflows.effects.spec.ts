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
import { Observable } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Actions } from '@ngrx/effects';
import { cold } from 'jasmine-marbles';
import {
  CreateWorkflow,
  DeleteWorkflow,
  InitializeWorkflows,
  RunWorkflow,
  StartWorkflowInitialization,
  SwitchWorkflowActiveState,
  UpdateWorkflow,
} from './workflows.actions';
import * as WorkflowsActions from './workflows.actions';

import { WorkflowsEffects } from './workflows.effects';
import { WorkflowService } from '../../services/workflow/workflow.service';
import { ProjectModel } from '../../models/project.model';
import { WorkflowModel } from '../../models/workflow.model';
import { provideMockStore } from '@ngrx/store/testing';
import { DynamicFormPart, DynamicFormParts, FormPart, WorkflowFormPartsModel } from '../../models/workflowFormParts.model';
import {
  workflowFormParts,
  workflowFormParts as workflowFormPartsConsts,
  workflowFormPartsSequences,
} from '../../constants/workflowFormParts.constants';
import { workflowModes } from '../../models/enums/workflowModes.constants';
import { SensorModel } from '../../models/sensor.model';
import { DagDefinitionJoinedModel } from '../../models/dagDefinitionJoined.model';
import { WorkflowJoinedModel } from '../../models/workflowJoined.model';
import { WorkflowEntryModel } from '../../models/workflowEntry.model';
import { JobDefinitionModel } from '../../models/jobDefinition.model';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { texts } from '../../constants/texts.constants';
import { Router } from '@angular/router';
import { absoluteRoutes } from '../../constants/routes.constants';

describe('WorkflowsEffects', () => {
  let underTest: WorkflowsEffects;
  let workflowService: WorkflowService;
  let mockActions: Observable<any>;
  let toastrService: ToastrService;
  let router: Router;

  const initialAppState = {
    workflows: {
      workflowAction: {
        mode: workflowModes.CREATE,
        workflowData: {
          details: [{ property: 'detailProp', value: 'detailVal' }],
          sensor: [{ property: 'sensorProp', value: 'sensorVal' }],
          jobs: [{ jobId: 'jobId', order: 0, entries: [{ property: 'jobProp', value: 'jobVal' }] }],
        },
      },
      workflowFormParts: new WorkflowFormPartsModel(
        workflowFormPartsSequences.allDetails,
        workflowFormPartsConsts.SENSOR.SENSOR_TYPE,
        workflowFormPartsConsts.JOB.JOB_NAME,
        workflowFormPartsConsts.JOB.JOB_TYPE,
        new DynamicFormParts([], []),
      ),
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WorkflowsEffects,
        WorkflowService,
        provideMockActions(() => mockActions),
        provideMockStore({ initialState: initialAppState }),
        ToastrService,
      ],
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([]), ToastrModule.forRoot()],
    });
    underTest = TestBed.inject(WorkflowsEffects);
    workflowService = TestBed.inject(WorkflowService);
    mockActions = TestBed.inject(Actions);
    toastrService = TestBed.inject(ToastrService);
    router = TestBed.inject(Router);
  });

  describe('workflowsInitialize', () => {
    it('should return workflows and projects', () => {
      const projects = [
        new ProjectModel('projectName1', [
          new WorkflowModel('workflowName1', true, 'projectName1', new Date(Date.now()), new Date(Date.now()), 0),
        ]),
        new ProjectModel('projectName2', [
          new WorkflowModel('workflowName2', true, 'projectName2', new Date(Date.now()), new Date(Date.now()), 1),
        ]),
      ];

      const dynamicFormParts = new DynamicFormParts(
        [new DynamicFormPart('typeOne', [new FormPart('nameOne', 'propertyOne', true, 'string-field')])],
        [new DynamicFormPart('typeTwo', [new FormPart('nameTwo', 'propertyTwo', false, 'string-field')])],
      );

      const workflowFormParts = new WorkflowFormPartsModel(
        workflowFormPartsSequences.allDetails,
        workflowFormPartsConsts.SENSOR.SENSOR_TYPE,
        workflowFormPartsConsts.JOB.JOB_NAME,
        workflowFormPartsConsts.JOB.JOB_TYPE,
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

      spyOn(workflowService, 'getProjects').and.returnValue(getProjectsResponse);
      spyOn(workflowService, 'getWorkflowDynamicFormParts').and.returnValue(getWorkflowDynamicFormPartsResponse);

      expect(underTest.workflowsInitialize).toBeObservable(expected);
    });

    it('should return initialize workflows failure if workflowService.getWorkflowDynamicFormParts responds with an error', () => {
      const projects = [
        new ProjectModel('projectName1', [
          new WorkflowModel('workflowName1', true, 'projectName1', new Date(Date.now()), new Date(Date.now()), 0),
        ]),
        new ProjectModel('projectName2', [
          new WorkflowModel('workflowName2', true, 'projectName2', new Date(Date.now()), new Date(Date.now()), 1),
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

      spyOn(workflowService, 'getProjects').and.returnValue(getProjectsResponse);
      spyOn(workflowService, 'getWorkflowDynamicFormParts').and.returnValue(getWorkflowDynamicFormPartsResponse);

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

      spyOn(workflowService, 'getWorkflow').and.returnValue(getWorkflowResponse);

      expect(underTest.workflowInitializationStart).toBeObservable(expected);
    });

    it('should initialize workflow', () => {
      const workflow = new WorkflowJoinedModel(
        'name',
        true,
        'project',
        undefined,
        new SensorModel(10, { name: 'name' }, undefined, 10),
        new DagDefinitionJoinedModel(10, [new JobDefinitionModel(10, 'name', { name: 'name' }, undefined, 0, 10)], 10),
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
              new WorkflowEntryModel(workflowFormParts.DETAILS.WORKFLOW_NAME.property, workflow.name),
              new WorkflowEntryModel(workflowFormParts.DETAILS.PROJECT_NAME.property, workflow.project),
              new WorkflowEntryModel(workflowFormParts.DETAILS.IS_ACTIVE.property, workflow.isActive),
            ],
            sensorData: [new WorkflowEntryModel(workflowFormParts.SENSOR.SENSOR_TYPE.property, workflow.sensor.sensorType.name)],
            jobsData: [
              jasmine.objectContaining({
                order: 0,
                entries: [
                  new WorkflowEntryModel(
                    workflowFormParts.JOB.JOB_TYPE.property,
                    workflow.dagDefinitionJoined.jobDefinitions[0].jobType.name,
                  ),
                  new WorkflowEntryModel(workflowFormParts.JOB.JOB_NAME.property, workflow.dagDefinitionJoined.jobDefinitions[0].name),
                ],
              }),
            ],
          },
        },
      });

      spyOn(workflowService, 'getWorkflow').and.returnValue(getWorkflowResponse);

      expect(underTest.workflowInitializationStart).toBeObservable(expected);
    });
  });

  describe('workflowDelete', () => {
    it('should return delete workflow success when service returns success deletion', () => {
      const toastrServiceSpy = spyOn(toastrService, 'success');
      const routerSpy = spyOn(router, 'navigateByUrl');
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

      spyOn(workflowService, 'deleteWorkflow').and.returnValue(deleteWorkflowResponse);

      expect(underTest.workflowDelete).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.DELETE_WORKFLOW_SUCCESS_NOTIFICATION);
      expect(routerSpy).toHaveBeenCalledTimes(1);
      expect(routerSpy).toHaveBeenCalledWith(absoluteRoutes.WORKFLOWS_HOME);
    });

    it('should return delete workflow failure when service fails to delete workflow', () => {
      const toastrServiceSpy = spyOn(toastrService, 'error');
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

      spyOn(workflowService, 'deleteWorkflow').and.returnValue(deleteWorkflowResponse);

      expect(underTest.workflowDelete).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.DELETE_WORKFLOW_FAILURE_NOTIFICATION);
    });

    it('should return delete workflow failure when service throws exception while deleting workflow', () => {
      const toastrServiceSpy = spyOn(toastrService, 'error');
      const payload = 10;
      const action = new DeleteWorkflow(payload);
      mockActions = cold('-a', { a: action });

      const errorResponse = cold('-#|');
      spyOn(workflowService, 'deleteWorkflow').and.returnValue(errorResponse);

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
      const toastrServiceSpy = spyOn(toastrService, 'success');
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

      spyOn(workflowService, 'switchWorkflowActiveState').and.returnValue(switchWorkflowActiveStateResponse);

      expect(underTest.workflowActiveStateSwitch).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.SWITCH_WORKFLOW_ACTIVE_STATE_SUCCESS_NOTIFICATION(payload.currentActiveState));
    });

    it('should not switch workflow active state when service fails to switches state', () => {
      const toastrServiceSpy = spyOn(toastrService, 'error');
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

      spyOn(workflowService, 'switchWorkflowActiveState').and.returnValue(switchWorkflowActiveStateResponse);

      expect(underTest.workflowActiveStateSwitch).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.SWITCH_WORKFLOW_ACTIVE_STATE_FAILURE_NOTIFICATION);
    });

    it('should not switch workflow active state when service throws exception while switching active state', () => {
      const toastrServiceSpy = spyOn(toastrService, 'error');
      const payload = { id: 10, currentActiveState: true };
      const action = new SwitchWorkflowActiveState(payload);
      mockActions = cold('-a', { a: action });

      const errorResponse = cold('-#|');
      spyOn(workflowService, 'switchWorkflowActiveState').and.returnValue(errorResponse);

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

  describe('runWorkflow', () => {
    it('should display success when service successfully runs workflow', () => {
      const toastrServiceSpy = spyOn(toastrService, 'success');
      const payload = 42;
      const response = true;

      const action = new RunWorkflow(payload);
      mockActions = cold('-a', { a: action });

      const runWorkflowResponse = cold('-a|', { a: response });
      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.RUN_WORKFLOW_SUCCESS,
        },
      });

      spyOn(workflowService, 'runWorkflow').and.returnValue(runWorkflowResponse);

      expect(underTest.workflowRun).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.RUN_WORKFLOW_SUCCESS_NOTIFICATION);
    });

    it('should display failure when service fails to run workflow', () => {
      const toastrServiceSpy = spyOn(toastrService, 'error');
      const payload = 42;
      const response = false;

      const action = new RunWorkflow(payload);
      mockActions = cold('-a', { a: action });

      const runWorkflowResponse = cold('-a|', { a: response });
      spyOn(workflowService, 'runWorkflow').and.returnValue(runWorkflowResponse);

      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.RUN_WORKFLOW_FAILURE,
        },
      });
      expect(underTest.workflowRun).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.RUN_WORKFLOW_FAILURE_NOTIFICATION);
    });

    it('should display failure when service throws an exception while running workflow', () => {
      const toastrServiceSpy = spyOn(toastrService, 'error');
      const payload = 42;
      const action = new RunWorkflow(payload);
      mockActions = cold('-a', { a: action });

      const runWorkflowResponse = cold('-#|');
      spyOn(workflowService, 'runWorkflow').and.returnValue(runWorkflowResponse);

      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.RUN_WORKFLOW_FAILURE,
        },
      });
      expect(underTest.workflowRun).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.RUN_WORKFLOW_FAILURE_NOTIFICATION);
    });
  });

  describe('workflowCreate', () => {
    it('should return create workflow failure when service fails to create workflow', () => {
      const toastrServiceSpy = spyOn(toastrService, 'error');

      const action = new CreateWorkflow();
      mockActions = cold('-a', { a: action });
      const createWorkflowResponse = cold('-#|');

      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.CREATE_WORKFLOW_FAILURE,
        },
      });

      spyOn(workflowService, 'createWorkflow').and.returnValue(createWorkflowResponse);

      expect(underTest.workflowCreate).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.CREATE_WORKFLOW_FAILURE_NOTIFICATION);
    });

    it('should return create workflow success when service returns success creation', () => {
      const toastrServiceSpy = spyOn(toastrService, 'success');
      const routerSpy = spyOn(router, 'navigateByUrl');

      const workflow = new WorkflowJoinedModel(
        'name',
        true,
        'project',
        undefined,
        new SensorModel(10, { name: 'name' }, undefined, 10),
        new DagDefinitionJoinedModel(10, [new JobDefinitionModel(10, 'name', { name: 'name' }, undefined, 0, 10)], 10),
        10,
      );
      const createWorkflowSuccessPayload: WorkflowModel = new WorkflowModel(
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

      spyOn(workflowService, 'createWorkflow').and.returnValue(createWorkflowResponse);

      expect(underTest.workflowCreate).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.CREATE_WORKFLOW_SUCCESS_NOTIFICATION);
      expect(routerSpy).toHaveBeenCalledTimes(1);
      expect(routerSpy).toHaveBeenCalledWith(absoluteRoutes.SHOW_WORKFLOW + '/' + workflow.id);
    });
  });

  describe('workflowUpdate', () => {
    it('should return update workflow failure when service fails to update workflow', () => {
      const toastrServiceSpy = spyOn(toastrService, 'error');

      const action = new UpdateWorkflow();
      mockActions = cold('-a', { a: action });
      const updateWorkflowResponse = cold('-#|');

      const expected = cold('--a', {
        a: {
          type: WorkflowsActions.UPDATE_WORKFLOW_FAILURE,
        },
      });

      spyOn(workflowService, 'updateWorkflow').and.returnValue(updateWorkflowResponse);

      expect(underTest.workflowUpdate).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.UPDATE_WORKFLOW_FAILURE_NOTIFICATION);
    });

    it('should return create workflow success when service returns success creation', () => {
      const toastrServiceSpy = spyOn(toastrService, 'success');
      const routerSpy = spyOn(router, 'navigateByUrl');

      const workflow = new WorkflowJoinedModel(
        'name',
        true,
        'project',
        undefined,
        new SensorModel(10, { name: 'name' }, undefined, 10),
        new DagDefinitionJoinedModel(10, [new JobDefinitionModel(10, 'name', { name: 'name' }, undefined, 0, 10)], 10),
        10,
      );
      const updateWorkflowSuccessPayload: WorkflowModel = new WorkflowModel(
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

      spyOn(workflowService, 'updateWorkflow').and.returnValue(updateWorkflowResponse);

      expect(underTest.workflowUpdate).toBeObservable(expected);
      expect(toastrServiceSpy).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.UPDATE_WORKFLOW_SUCCESS_NOTIFICATION);
      expect(routerSpy).toHaveBeenCalledTimes(1);
      expect(routerSpy).toHaveBeenCalledWith(absoluteRoutes.SHOW_WORKFLOW + '/' + workflow.id);
    });
  });
});
