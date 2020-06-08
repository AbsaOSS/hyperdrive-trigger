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
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../models/workflowEntry.model';
import { JobEntryModel, JobEntryModelFactory } from '../../models/jobEntry.model';
import { State, workflowsReducer } from './workflows.reducers';
import { UuidUtil } from '../../utils/uuid/uuid.util';

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

  const initialAppState: State = {
    projects: [],
    loading: true,
    workflowAction: {
      id: undefined,
      mode: undefined,
      loading: true,
      workflow: undefined,
      backendValidationErrors: [],
      workflowData: {
        details: [],
        sensor: [],
        jobs: [job1, job0, job2, job3],
      },
    },
    workflowFormParts: undefined,
  };

  describe('workflowsInitialize', () => {
    it('WORKFLOW_REMOVE_JOB should remove the job and adjust orders', () => {
      const state = workflowsReducer(initialAppState, new WorkflowRemoveJob(uuid1));

      expect(state.workflowAction.workflowData.jobs.length).toBe(3);
      expect(state.workflowAction.workflowData.jobs).toContain(job0);
      expect(state.workflowAction.workflowData.jobs).toContain({ ...job2, order: 1 });
      expect(state.workflowAction.workflowData.jobs).toContain({ ...job3, order: 2 });
    });
  });
});
