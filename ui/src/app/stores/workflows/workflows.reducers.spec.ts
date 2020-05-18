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
import { WorkflowEntryModel } from '../../models/workflowEntry.model';
import { JobEntryModel } from '../../models/jobEntry.model';
import { State, workflowsReducer } from './workflows.reducers';
import { UuidUtil } from '../../utils/uuid/uuid.util';

describe('WorkflowsReducers', () => {
  const uuid0 = UuidUtil.createUUID();
  const uuid1 = UuidUtil.createUUID();
  const uuid2 = UuidUtil.createUUID();
  const uuid3 = UuidUtil.createUUID();

  const job0 = JobEntryModel.createAsObject(uuid0, 0, [
    new WorkflowEntryModel('name', 'Job Number Zero'),
    new WorkflowEntryModel('jobParameters.variables.scriptLocation', '/tmp/somewhere/script.sh'),
    new WorkflowEntryModel('jobType.name', 'Shell'),
  ]);
  const job1 = JobEntryModel.createAsObject(uuid1, 1, [
    new WorkflowEntryModel('name', 'Job Number One'),
    new WorkflowEntryModel('jobParameters.variables.jobJar', '/etc/driver.jar'),
    new WorkflowEntryModel('jobParameters.variables.mainClass', 'za.co.absa.hyperdrive.MainClass'),
    new WorkflowEntryModel('jobParameters.variables.deploymentMode', 'cluster'),
    new WorkflowEntryModel('jobType.name', 'Spark'),
  ]);
  const job2 = JobEntryModel.createAsObject(uuid2, 2, [
    new WorkflowEntryModel('name', 'Job Number Two'),
    new WorkflowEntryModel('jobParameters.variables.jobJar', '/etc/driver2.jar'),
    new WorkflowEntryModel('jobParameters.variables.mainClass', 'za.co.absa.hyperdrive.MainClass2'),
    new WorkflowEntryModel('jobParameters.variables.deploymentMode', 'client'),
    new WorkflowEntryModel('jobType.name', 'Spark'),
  ]);
  const job3 = JobEntryModel.createAsObject(uuid3, 3, [
    new WorkflowEntryModel('name', 'Job Number Three'),
    new WorkflowEntryModel('jobParameters.variables.scriptLocation', '/tmp/somepath/script.sh'),
    new WorkflowEntryModel('jobType.name', 'Shell'),
  ]);

  const initialAppState: State = {
    projects: [],
    loading: true,
    workflowAction: {
      id: undefined,
      mode: undefined,
      loading: true,
      workflow: undefined,
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
