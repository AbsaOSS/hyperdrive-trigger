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

import {TestBed} from '@angular/core/testing';
// import {RunsEffects} from "./work.effects";
import {DagRunService} from "../../services/dagRun/dag-run.service";
import {Observable} from "rxjs";
import {provideMockActions} from "@ngrx/effects/testing";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {Actions} from "@ngrx/effects";
import {cold} from 'jasmine-marbles';
import {InitializeWorkflows} from "./workflows.actions";
import * as WorkflowsActions from "./workflows.actions";

import {DagRunModel} from "../../models/dagRuns/dagRun.model";
import {DagRunsSearchResponseModel} from "../../models/dagRuns/dagRunsSearchResponse.model";
import {SortModel} from "../../models/dagRuns/dagRunsSearchRequest.model";
import {WorkflowsEffects} from "./workflows.effects";
import {WorkflowService} from "../../services/workflow/workflow.service";
import {ProjectModel} from "../../models/project.model";
import {WorkflowModel} from "../../models/workflow.model";

describe('WorkflowsEffects', () => {
  let underTest: WorkflowsEffects;
  let workflowService: WorkflowService;
  let mockActions: Observable<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WorkflowsEffects,
        WorkflowService,
        provideMockActions(() => mockActions),
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

      const action = new InitializeWorkflows();
      mockActions = cold('-a', { a: action });
      const getProjectsResponse = cold('-a|', { a: projects });
      const expected = cold('--a', { a: {
          type: WorkflowsActions.INITIALIZE_WORKFLOWS_SUCCESS,
          payload: {projects: projects, workflows: [].concat(projects.map((project) => project.workflows))}
        }});

      spyOn(workflowService, 'getProjects').and.returnValue(getProjectsResponse);

      expect(underTest.workflowsInitialize).toBeObservable(expected);
    });

    it ('should return initialize workflows failure if workflowService.getProjects responds with an error', () => {
      const action = new InitializeWorkflows();
      mockActions = cold('-a', { a: action });
      const errorResponse = cold('-#|');
      spyOn(workflowService, 'getProjects').and.returnValue(errorResponse);

      const expected = cold('--a', { a: {
          type: WorkflowsActions.INITIALIZE_WORKFLOWS_FAILURE
        }});
      expect(underTest.workflowsInitialize).toBeObservable(expected);
    });
  });

});
