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

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { api } from '../../constants/api.constants';
import { WorkflowService } from './workflow.service';
import { ProjectModel } from '../../models/project.model';
import { WorkflowModel } from '../../models/workflow.model';
import { WorkflowJoinedModel } from '../../models/workflowJoined.model';

describe('WorkflowService', () => {
  let underTest: WorkflowService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WorkflowService],
      imports: [HttpClientTestingModule],
    });
    underTest = TestBed.inject(WorkflowService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(underTest).toBeTruthy();
  });

  it('getProjects() should return projects', () => {
    const projects = [
      new ProjectModel('projectName1', [
        new WorkflowModel('workflowName1', true, 'projectName1', new Date(Date.now()), new Date(Date.now()), 0),
      ]),
    ];

    underTest.getProjects().subscribe(
      (data) => expect(data).toEqual(projects),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.GET_PROJECTS);
    expect(req.request.method).toEqual('GET');
    req.flush([...projects]);
  });

  it('getWorkflow() should return workflow data', () => {
    const workflow = new WorkflowJoinedModel('name', true, 'project', undefined, undefined, undefined, 0);

    underTest.getWorkflow(workflow.id).subscribe(
      (data) => expect(data).toEqual(workflow),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.GET_WORKFLOW + '?id=' + workflow.id);
    expect(req.request.method).toEqual('GET');
    req.flush(workflow);
  });

  it('deleteWorkflow() should delete workflow', () => {
    const id = 1;
    const response = true;
    underTest.deleteWorkflow(id).subscribe(
      (data) => expect(data).toEqual(response),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.DELETE_WORKFLOW + '?id=' + id);
    expect(req.request.method).toEqual('DELETE');
    req.flush(new Boolean(true));
  });

  it('switchWorkflowActiveState() should switch workflow active state', () => {
    const id = 1;
    const response = true;
    underTest.switchWorkflowActiveState(id).subscribe(
      (data) => expect(data).toEqual(response),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.SWITCH_WORKFLOW_ACTIVE_STATE.replace('{id}', id.toString()));
    expect(req.request.method).toEqual('POST');
    req.flush(new Boolean(true));
  });
});
