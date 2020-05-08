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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowsHomeComponent } from './workflows-home.component';
import { provideMockStore } from '@ngrx/store/testing';
import { ProjectModel } from '../../../models/project.model';
import { WorkflowModel } from '../../../models/workflow.model';

describe('WorkflowsHomeComponent', () => {
  let fixture: ComponentFixture<WorkflowsHomeComponent>;
  let underTest: WorkflowsHomeComponent;

  const initialAppState = {
    workflows: {
      projects: [
        new ProjectModel('projectOne', [new WorkflowModel('workflowOne', undefined, undefined, undefined, undefined, undefined)]),
        new ProjectModel('projectTwo', [new WorkflowModel('workflowTwo', undefined, undefined, undefined, undefined, undefined)]),
      ],
    },
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({ initialState: initialAppState })],
      declarations: [WorkflowsHomeComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowsHomeComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it('should after view init set component properties', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.workflows).toEqual([].concat(...initialAppState.workflows.projects.map((project) => project.workflows)));
    });
  }));
});
