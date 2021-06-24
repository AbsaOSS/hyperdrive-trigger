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

import { WorkflowHistoryService } from './workflow-history.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WorkflowService } from '../workflow/workflow.service';
import { WorkflowJoinedModelFactory } from '../../models/workflowJoined.model';
import { api } from '../../constants/api.constants';
import { HistoryModelFactory, HistoryPairModel, WorkflowHistoryModel, WorkflowHistoryModelFactory } from '../../models/historyModel';

describe('WorkflowHistoryService', () => {
  let underTest: WorkflowHistoryService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WorkflowService],
      imports: [HttpClientTestingModule],
    });
    underTest = TestBed.inject(WorkflowHistoryService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(underTest).toBeTruthy();
  });

  it('getHistoryForWorkflow() should return history for workflow', () => {
    const workflowId = 1;
    const history = HistoryModelFactory.create(2, new Date(Date.now()), 'userName', { name: 'Create' });

    underTest.getHistoryForWorkflow(workflowId).subscribe(
      (data) => expect(data).toEqual([history]),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.GET_HISTORY_FOR_WORKFLOW + `?workflowId=${workflowId}`);
    expect(req.request.method).toEqual('GET');
    req.flush([history]);
  });

  it('getWorkflowsFromHistory() should return workflows from history', () => {
    const leftWorkflowHistoryId = 11;
    const rightWorkflowHistoryId = 12;

    const history = HistoryModelFactory.create(2, new Date(Date.now()), 'userName', { name: 'Create' });

    const workflow = WorkflowJoinedModelFactory.create('name', true, 'project', undefined, undefined, undefined, 0);

    const workflowHistoriesForComparison: HistoryPairModel<WorkflowHistoryModel> = {
      leftHistory: WorkflowHistoryModelFactory.create(history, leftWorkflowHistoryId, workflow),
      rightHistory: WorkflowHistoryModelFactory.create(history, rightWorkflowHistoryId, workflow),
    };

    underTest.getWorkflowsFromHistory(leftWorkflowHistoryId, rightWorkflowHistoryId).subscribe(
      (data) => expect(data).toEqual(workflowHistoriesForComparison),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(
      api.GET_WORKFLOWS_FROM_HISTORY + `?leftWorkflowHistoryId=${leftWorkflowHistoryId}&rightWorkflowHistoryId=${rightWorkflowHistoryId}`,
    );
    expect(req.request.method).toEqual('GET');
    req.flush(workflowHistoriesForComparison);
  });
});
