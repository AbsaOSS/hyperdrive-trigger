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

import { WorkflowRemoveJob } from './workflows.actions';
import { WorkflowEntryModelFactory } from '../../models/workflowEntry.model';
import { JobEntryModel, JobEntryModelFactory } from '../../models/jobEntry.model';
import { State, workflowsReducer } from './workflows.reducers';
import { UuidUtil } from '../../utils/uuid/uuid.util';
import { ProjectModelFactory } from '../../models/project.model';
import { WorkflowModelFactory } from '../../models/workflow.model';
import { sortProjectsAndWorkflows, switchJobs } from './workflows.reducers';

describe('WorkflowsReducers', () => {
  const uuid0 = UuidUtil.createUUID();
  const uuid1 = UuidUtil.createUUID();
  const uuid2 = UuidUtil.createUUID();
  const uuid3 = UuidUtil.createUUID();

  const job0 = JobEntryModelFactory.create(uuid0, 0, [
    WorkflowEntryModelFactory.create('name', 'Job Number Zero'),
    WorkflowEntryModelFactory.create('jobParameters.variables.scriptLocation', '/tmp/somewhere/script.sh'),
    WorkflowEntryModelFactory.create('jobType.name', 'Shell'),
  ]);
  const job1 = JobEntryModelFactory.create(uuid1, 1, [
    WorkflowEntryModelFactory.create('name', 'Job Number One'),
    WorkflowEntryModelFactory.create('jobParameters.variables.jobJar', '/etc/driver.jar'),
    WorkflowEntryModelFactory.create('jobParameters.variables.mainClass', 'za.co.absa.hyperdrive.MainClass'),
    WorkflowEntryModelFactory.create('jobParameters.variables.deploymentMode', 'cluster'),
    WorkflowEntryModelFactory.create('jobType.name', 'Spark'),
  ]);
  const job2 = JobEntryModelFactory.create(uuid2, 2, [
    WorkflowEntryModelFactory.create('name', 'Job Number Two'),
    WorkflowEntryModelFactory.create('jobParameters.variables.jobJar', '/etc/driver2.jar'),
    WorkflowEntryModelFactory.create('jobParameters.variables.mainClass', 'za.co.absa.hyperdrive.MainClass2'),
    WorkflowEntryModelFactory.create('jobParameters.variables.deploymentMode', 'client'),
    WorkflowEntryModelFactory.create('jobType.name', 'Spark'),
  ]);
  const job3 = JobEntryModelFactory.create(uuid3, 3, [
    WorkflowEntryModelFactory.create('name', 'Job Number Three'),
    WorkflowEntryModelFactory.create('jobParameters.variables.scriptLocation', '/tmp/somepath/script.sh'),
    WorkflowEntryModelFactory.create('jobType.name', 'Shell'),
  ]);

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
      workflow: undefined,
      workflowFormParts: undefined,
      backendValidationErrors: [],
      workflowFormData: {
        details: [],
        sensor: [],
        jobs: [job1, job0, job2, job3],
      },
      initialWorkflowFormData: {
        details: [],
        sensor: [],
        jobs: [job1, job0, job2, job3],
      },
      workflowFile: undefined,
    },
    workflowsSort: undefined,
    workflowsFilters: [],
    history: {
      loading: true,
      workflowHistory: [],
      workflowFormParts: undefined,
      leftWorkflowHistoryData: undefined,
      leftWorkflowHistory: undefined,
      rightWorkflowHistoryData: undefined,
      rightWorkflowHistory: undefined,
    },
    jobsForRun: undefined,
  };

  describe('workflowsInitialize', () => {
    it('WORKFLOW_REMOVE_JOB should remove the job and adjust orders', () => {
      const state = workflowsReducer(initialAppState, new WorkflowRemoveJob(uuid1));

      expect(state.workflowAction.workflowFormData.jobs.length).toBe(3);
      expect(state.workflowAction.workflowFormData.jobs).toContain(job0);
      expect(state.workflowAction.workflowFormData.jobs).toContain({ ...job2, order: 1 });
      expect(state.workflowAction.workflowFormData.jobs).toContain({ ...job3, order: 2 });
    });
  });

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

  describe('switchJobs', () => {
    it('should switch and sort jobs', () => {
      const job0 = JobEntryModelFactory.create(UuidUtil.createUUID(), 0, []);
      const job1 = JobEntryModelFactory.create(UuidUtil.createUUID(), 1, []);
      const job2 = JobEntryModelFactory.create(UuidUtil.createUUID(), 2, []);

      const jobs: JobEntryModel[] = [job0, job1, job2];
      const updatedJobs: JobEntryModel[] = [{ ...job2, order: 0 }, job1, { ...job0, order: 2 }];

      expect(switchJobs(jobs, 0, 2)).toEqual(updatedJobs);
      expect(switchJobs(jobs, 2, 0)).toEqual(updatedJobs);
    });

    it('should do nothing when positions are equal', () => {
      const job0 = JobEntryModelFactory.create(UuidUtil.createUUID(), 0, []);
      const job1 = JobEntryModelFactory.create(UuidUtil.createUUID(), 1, []);
      const job2 = JobEntryModelFactory.create(UuidUtil.createUUID(), 2, []);

      const jobs: JobEntryModel[] = [job0, job1, job2];

      expect(switchJobs(jobs, 1, 1)).toEqual(jobs);
    });
  });
});
