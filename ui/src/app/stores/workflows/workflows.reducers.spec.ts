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

import { ProjectModelFactory, WorkflowIdentityModelFactory } from '../../models/project.model';
import { sortProjects, addWorkflow, filterProjects } from './workflows.reducers';
import { WorkflowModelFactory } from '../../models/workflow.model';

describe('WorkflowsReducers', () => {
  describe('sortProjects', () => {
    it('should sort projects and workflows', () => {
      const projects = [
        ProjectModelFactory.create('projectName2', [
          WorkflowIdentityModelFactory.create(5, 'workflowName5'),
          WorkflowIdentityModelFactory.create(1, 'workflowName1'),
          WorkflowIdentityModelFactory.create(4, 'workflowName4'),
          WorkflowIdentityModelFactory.create(3, 'workflowName3'),
          WorkflowIdentityModelFactory.create(2, 'workflowName2'),
        ]),
        ProjectModelFactory.create('projectName1', [
          WorkflowIdentityModelFactory.create(7, 'workflowName7'),
          WorkflowIdentityModelFactory.create(6, 'workflowName6'),
        ]),
        ProjectModelFactory.create('projectName3', [
          WorkflowIdentityModelFactory.create(0, 'workflowName0'),
          WorkflowIdentityModelFactory.create(10, 'workflowName10'),
          WorkflowIdentityModelFactory.create(8, 'workflowName8'),
          WorkflowIdentityModelFactory.create(9, 'workflowName9'),
        ]),
      ];

      const result = sortProjects(projects);

      expect(result.map((r) => r.name)).toEqual(projects.sort((l, r) => l.name.localeCompare(r.name)).map((p) => p.name));
      result.forEach((r) => {
        expect(r.workflows.map((w) => w.name)).toEqual(r.workflows.sort((l, r) => l.name.localeCompare(r.name)).map((w) => w.name));
      });
    });
  });

  describe('addWorkflow', () => {
    it('should add workflows into empty projects', () => {
      const projects = [];
      const w1p1 = WorkflowModelFactory.create('workflowName1', true, 'projectName1', undefined, undefined, 1, 1);
      const w2p1 = WorkflowModelFactory.create('workflowName2', true, 'projectName1', undefined, undefined, 1, 2);
      const w3p2 = WorkflowModelFactory.create('workflowName3', true, 'projectName2', undefined, undefined, 1, 3);

      const result = addWorkflow([w1p1, w2p1, w3p2], projects);
      expect(result.length).toEqual(2);
      expect(result[0].workflows.length).toEqual(2);
      expect(result[1].workflows.length).toEqual(1);
    });

    it('should add workflows into non empty projects', () => {
      const projects = [
        ProjectModelFactory.create('projectName1', [
          WorkflowModelFactory.create('workflowName1', true, 'projectName1', undefined, undefined, 1, 1),
        ]),
        ProjectModelFactory.create('projectName2', [
          WorkflowModelFactory.create('workflowName3', true, 'projectName2', undefined, undefined, 1, 3),
        ]),
      ];
      const w2p1 = WorkflowModelFactory.create('workflowName2', true, 'projectName1', undefined, undefined, 1, 2);

      const result = addWorkflow([w2p1], projects);
      expect(result.length).toEqual(2);
      expect(result[0].workflows.length).toEqual(2);
      expect(result[1].workflows.length).toEqual(1);
    });
  });

  describe('filterProjects', () => {
    it('should filter projects', () => {
      const projects = [
        ProjectModelFactory.create('projectName2', [
          WorkflowIdentityModelFactory.create(5, 'workflowName5'),
          WorkflowIdentityModelFactory.create(1, 'workflowName1'),
          WorkflowIdentityModelFactory.create(4, 'workflowName4'),
          WorkflowIdentityModelFactory.create(3, 'workflowName3'),
          WorkflowIdentityModelFactory.create(2, 'workflowName2'),
        ]),
        ProjectModelFactory.create('projectName1', [
          WorkflowIdentityModelFactory.create(7, 'workflowName7'),
          WorkflowIdentityModelFactory.create(6, 'workflowName6'),
        ]),
        ProjectModelFactory.create('projectName3', [
          WorkflowIdentityModelFactory.create(0, 'workflowName0'),
          WorkflowIdentityModelFactory.create(10, 'workflowName10'),
          WorkflowIdentityModelFactory.create(8, 'workflowName8'),
          WorkflowIdentityModelFactory.create(9, 'workflowName9'),
        ]),
      ];

      const filterByEmptyString = filterProjects('', projects);
      const filterByExactMatch = filterProjects('workflowName0', projects);
      const filterByPartialMatch = filterProjects('workflowName1', projects);

      expect(filterByEmptyString).toEqual(projects);
      expect(filterByExactMatch.length).toEqual(1);
      expect(filterByPartialMatch.length).toEqual(2);
    });
  });
});
