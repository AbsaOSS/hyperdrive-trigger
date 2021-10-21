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

import { State } from './workflows.reducers';
import { ProjectModelFactory } from '../../models/project.model';
import { WorkflowModelFactory } from '../../models/workflow.model';
import { sortProjectsAndWorkflows } from './workflows.reducers';
import { WorkflowJoinedModelFactory } from '../../models/workflowJoined.model';

describe('WorkflowsReducers', () => {
  const workflow = WorkflowJoinedModelFactory.createEmpty();

  const unsortedProjects = [
    ProjectModelFactory.create('projectName3', [
      WorkflowModelFactory.create('workflowName10', true, 'projectName3', undefined, undefined, 10),
      WorkflowModelFactory.create('workflowName9', true, 'projectName3', undefined, undefined, 9),
      WorkflowModelFactory.create('workflowName0', true, 'projectName3', undefined, undefined, 0),
      WorkflowModelFactory.create('workflowName8', true, 'projectName3', undefined, undefined, 8),
    ]),
    ProjectModelFactory.create('projectName1', [
      WorkflowModelFactory.create('workflowName1', true, 'projectName1', undefined, undefined, 1),
      WorkflowModelFactory.create('workflowName4', true, 'projectName1', undefined, undefined, 4),
      WorkflowModelFactory.create('workflowName5', true, 'projectName1', undefined, undefined, 5),
      WorkflowModelFactory.create('workflowName3', true, 'projectName1', undefined, undefined, 3),
      WorkflowModelFactory.create('workflowName2', true, 'projectName1', undefined, undefined, 2),
    ]),
    ProjectModelFactory.create('projectName2', [
      WorkflowModelFactory.create('workflowName7', true, 'projectName2', undefined, undefined, 7),
      WorkflowModelFactory.create('workflowName6', true, 'projectName2', undefined, undefined, 6),
    ]),
  ];

  const initialAppState: State = {
    projects: unsortedProjects,
    loading: true,
    workflowAction: {
      id: undefined,
      mode: undefined,
      loading: true,
      workflow: workflow,
      workflowForForm: workflow,
      backendValidationErrors: [],
      workflowFile: undefined,
    },
    jobTemplates: [],
    workflowsSort: undefined,
    workflowsFilters: [],
    history: {
      loading: true,
      workflowHistory: [],
      leftWorkflowHistory: undefined,
      rightWorkflowHistory: undefined,
    },
    jobsForRun: undefined,
  };

  describe('sortProjectsAndWorkflows', () => {
    it('should sort projects and workflows', () => {
      const sortedProjects = [
        ProjectModelFactory.create('projectName1', [
          WorkflowModelFactory.create('workflowName1', true, 'projectName1', undefined, undefined, 1),
          WorkflowModelFactory.create('workflowName2', true, 'projectName1', undefined, undefined, 2),
          WorkflowModelFactory.create('workflowName3', true, 'projectName1', undefined, undefined, 3),
          WorkflowModelFactory.create('workflowName4', true, 'projectName1', undefined, undefined, 4),
          WorkflowModelFactory.create('workflowName5', true, 'projectName1', undefined, undefined, 5),
        ]),
        ProjectModelFactory.create('projectName2', [
          WorkflowModelFactory.create('workflowName6', true, 'projectName2', undefined, undefined, 6),
          WorkflowModelFactory.create('workflowName7', true, 'projectName2', undefined, undefined, 7),
        ]),
        ProjectModelFactory.create('projectName3', [
          WorkflowModelFactory.create('workflowName0', true, 'projectName3', undefined, undefined, 0),
          WorkflowModelFactory.create('workflowName10', true, 'projectName3', undefined, undefined, 10),
          WorkflowModelFactory.create('workflowName8', true, 'projectName3', undefined, undefined, 8),
          WorkflowModelFactory.create('workflowName9', true, 'projectName3', undefined, undefined, 9),
        ]),
      ];

      expect(sortProjectsAndWorkflows(initialAppState.projects)).toEqual(sortedProjects);
    });

    it('should fail sort projects and workflows when length is not the same ', () => {
      const sortedProjects = [
        ProjectModelFactory.create('', []),
        ProjectModelFactory.create('projectName1', [
          WorkflowModelFactory.create('workflowName1', true, 'projectName1', undefined, undefined, 1),
          WorkflowModelFactory.create('workflowName2', true, 'projectName1', undefined, undefined, 2),
          WorkflowModelFactory.create('workflowName3', true, 'projectName1', undefined, undefined, 3),
          WorkflowModelFactory.create('workflowName4', true, 'projectName1', undefined, undefined, 4),
          WorkflowModelFactory.create('workflowName5', true, 'projectName1', undefined, undefined, 5),
        ]),
        ProjectModelFactory.create('projectName2', [
          WorkflowModelFactory.create('workflowName6', true, 'projectName2', undefined, undefined, 6),
          WorkflowModelFactory.create('workflowName7', true, 'projectName2', undefined, undefined, 7),
        ]),
        ProjectModelFactory.create('projectName3', [
          WorkflowModelFactory.create('workflowName0', true, 'projectName3', undefined, undefined, 0),
          WorkflowModelFactory.create('workflowName10', true, 'projectName3', undefined, undefined, 10),
          WorkflowModelFactory.create('workflowName8', true, 'projectName3', undefined, undefined, 8),
          WorkflowModelFactory.create('workflowName9', true, 'projectName3', undefined, undefined, 9),
        ]),
      ];

      expect(sortProjectsAndWorkflows(initialAppState.projects) === sortedProjects).toBeFalse();
    });

    it('should sort projects and workflows when empty ', () => {
      const projects = [
        ProjectModelFactory.create('project2', []),
        ProjectModelFactory.create('project9', []),
        ProjectModelFactory.create('project4', []),
        ProjectModelFactory.create('project3', []),
      ];

      const sortedProjects = [
        ProjectModelFactory.create('project2', []),
        ProjectModelFactory.create('project3', []),
        ProjectModelFactory.create('project4', []),
        ProjectModelFactory.create('project9', []),
      ];

      expect(sortProjectsAndWorkflows(projects)).toEqual(sortedProjects);
    });
  });
});
