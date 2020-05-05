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
import { InitializeWorkflows } from './workflows.actions';
import * as WorkflowsActions from './workflows.actions';

import { WorkflowsEffects } from './workflows.effects';
import { WorkflowService } from '../../services/workflow/workflow.service';
import { ProjectModel } from '../../models/project.model';
import { WorkflowModel } from '../../models/workflow.model';
import {provideMockStore} from "@ngrx/store/testing";
import {
  DynamicFormPart,
  DynamicFormParts,
  FormPart,
  WorkflowFormPartsModel
} from "../../models/workflowFormParts.model";
import {
  workflowFormParts as workflowFormPartsConsts,
  workflowFormPartsSequences
} from "../../constants/workflowFormParts.constants";
import {workflowModes} from "../../models/enums/workflowModes.constants";

describe('WorkflowsEffects', () => {
  let underTest: WorkflowsEffects;
  let workflowService: WorkflowService;
  let mockActions: Observable<any>;

  const initialAppState = {
    workflows: {
      workflowAction: {
        mode: workflowModes.CREATE
      }
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WorkflowsEffects,
        WorkflowService,
        provideMockActions(() => mockActions),
        provideMockStore({ initialState: initialAppState })
      ],
      imports: [
        HttpClientTestingModule
      ]
    });
    underTest = TestBed.inject(WorkflowsEffects);
    workflowService = TestBed.inject(WorkflowService);
    mockActions = TestBed.inject(Actions);
  });

  describe('workflowsInitialize', () => {
    it ('should return workflows and projects', () => {
      let projects = [
        new ProjectModel(
          'projectName1',
          [
            new WorkflowModel('workflowName1', true, 'projectName1', new Date(Date.now()), new Date(Date.now()), 0)
          ]
        ),
        new ProjectModel(
          'projectName2',
          [
            new WorkflowModel('workflowName2', true, 'projectName2', new Date(Date.now()), new Date(Date.now()), 1)
          ]
        )
      ];

      let dynamicFormParts = new DynamicFormParts(
        [
          new DynamicFormPart('typeOne', [
            new FormPart('nameOne', 'propertyOne', true, 'string-field')
          ])
        ],
        [
          new DynamicFormPart('typeTwo', [
            new FormPart('nameTwo', 'propertyTwo', false, 'string-field'),
          ])
        ]
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

      const expected = cold('---a', { a: {
          type: WorkflowsActions.INITIALIZE_WORKFLOWS_SUCCESS,
          payload: {projects: projects, workflowFormParts: workflowFormParts}
        }});

      spyOn(workflowService, 'getProjects').and.returnValue(getProjectsResponse);
      spyOn(workflowService, 'getWorkflowDynamicFormParts').and.returnValue(getWorkflowDynamicFormPartsResponse);

      expect(underTest.workflowsInitialize).toBeObservable(expected);
    });

    it ('should return initialize workflows failure if workflowService.getWorkflowDynamicFormParts responds with an error', () => {
      let projects = [
        new ProjectModel(
          'projectName1',
          [
            new WorkflowModel('workflowName1', true, 'projectName1', new Date(Date.now()), new Date(Date.now()), 0)
          ]
        ),
        new ProjectModel(
          'projectName2',
          [
            new WorkflowModel('workflowName2', true, 'projectName2', new Date(Date.now()), new Date(Date.now()), 1)
          ]
        )
      ];

      const action = new InitializeWorkflows();
      mockActions = cold('-a', { a: action });
      const getProjectsResponse = cold('-a|', { a: projects });
      const getWorkflowDynamicFormPartsResponse = cold('-#|');

      const expected = cold('---a', { a: {
          type: WorkflowsActions.INITIALIZE_WORKFLOWS_FAILURE
        }});

      spyOn(workflowService, 'getProjects').and.returnValue(getProjectsResponse);
      spyOn(workflowService, 'getWorkflowDynamicFormParts').and.returnValue(getWorkflowDynamicFormPartsResponse);

      expect(underTest.workflowsInitialize).toBeObservable(expected);
    });
  });

  // describe('workflowInitializationStart', () => {
  //   it ('should set empty workflow when workflow mode is create', () => {
  //     // let projects = [
  //     //   new ProjectModel(
  //     //     'projectName1',
  //     //     [
  //     //       new WorkflowModel('workflowName1', true, 'projectName1', new Date(Date.now()), new Date(Date.now()), 0)
  //     //     ]
  //     //   ),
  //     //   new ProjectModel(
  //     //     'projectName2',
  //     //     [
  //     //       new WorkflowModel('workflowName2', true, 'projectName2', new Date(Date.now()), new Date(Date.now()), 1)
  //     //     ]
  //     //   )
  //     // ];
  //     //
  //     // let dynamicFormParts = new DynamicFormParts(
  //     //   [
  //     //     new DynamicFormPart('typeOne', [
  //     //       new FormPart('nameOne', 'propertyOne', true, 'string-field')
  //     //     ])
  //     //   ],
  //     //   [
  //     //     new DynamicFormPart('typeTwo', [
  //     //       new FormPart('nameTwo', 'propertyTwo', false, 'string-field'),
  //     //     ])
  //     //   ]
  //     // );
  //     //
  //     // const workflowFormParts = new WorkflowFormPartsModel(
  //     //   workflowFormPartsSequences.allDetails,
  //     //   workflowFormPartsConsts.SENSOR.SENSOR_TYPE,
  //     //   workflowFormPartsConsts.JOB.JOB_NAME,
  //     //   workflowFormPartsConsts.JOB.JOB_TYPE,
  //     //   dynamicFormParts,
  //     // );
  //     //
  //     // const action = new InitializeWorkflows();
  //     // mockActions = cold('-a', { a: action });
  //     // const getProjectsResponse = cold('-a|', { a: projects });
  //     // const getWorkflowDynamicFormPartsResponse = cold('-a|', { a: dynamicFormParts });
  //     //
  //     // const expected = cold('---a', { a: {
  //     //     type: WorkflowsActions.INITIALIZE_WORKFLOWS_SUCCESS,
  //     //     payload: {projects: projects, workflowFormParts: workflowFormParts}
  //     //   }});
  //     //
  //     // spyOn(workflowService, 'getProjects').and.returnValue(getProjectsResponse);
  //     // spyOn(workflowService, 'getWorkflowDynamicFormParts').and.returnValue(getWorkflowDynamicFormPartsResponse);
  //     //
  //     // expect(underTest.workflowsInitialize).toBeObservable(expected);
  //
  //     const expected = cold('a', { a: {
  //         type: WorkflowsActions.SET_EMPTY_WORKFLOW
  //       }});
  //     expect(underTest.workflowInitializationStart).toBeObservable(expected);
  //
  //   });
  // });

});

