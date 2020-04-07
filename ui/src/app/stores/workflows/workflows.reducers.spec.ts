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

import {workflowsReducer, State} from './workflows.reducers';
import {InitializeWorkflows, InitializeWorkflowsSuccess, InitializeWorkflowsFailure} from './workflows.actions';
import {ProjectModel} from '../../models/project.model';
import {WorkflowModel} from '../../models/workflow.model';

describe('WorkflowsReducers', () => {

  const initialState = {
    projects: [],
    workflows: [],
    loading: false
  } as State;

  it('should set loading to true on initialize workflows', () => {
    const workflowsAction = new InitializeWorkflows();

    const actual = workflowsReducer(initialState, workflowsAction);

    expect(actual).toEqual({...initialState, loading: true});
  });

  it('should set workflows, projects and loading to false on initialize workflows success', () => {
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
    const workflowsAction = new InitializeWorkflowsSuccess({
      projects: projects,
      workflows: [].concat(projects.map((project) => project.workflows))
    });
    const actual = workflowsReducer(initialState, workflowsAction);

    expect(actual).toEqual(
      {
        ...initialState,
        loading: false,
        projects: projects,
        workflows: [].concat(projects.map((project) => project.workflows))}
    );
  });

  it ('should set initial state with loading to false on initialize workflows failure', () => {
    const workflowsAction = new InitializeWorkflowsFailure();

    const actual = workflowsReducer(initialState, workflowsAction);

    expect(actual).toEqual({...initialState, loading: false});
  });

});
