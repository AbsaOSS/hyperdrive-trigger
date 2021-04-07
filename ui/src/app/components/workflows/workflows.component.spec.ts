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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WorkflowsComponent } from './workflows.component';
import { provideMockStore } from '@ngrx/store/testing';
import { ProjectModelFactory } from '../../models/project.model';
import { WorkflowModelFactory } from '../../models/workflow.model';

describe('WorkflowsComponent', () => {
  let fixture: ComponentFixture<WorkflowsComponent>;
  let underTest: WorkflowsComponent;

  const initialAppState = {
    workflows: {
      loading: true,
      projects: [
        ProjectModelFactory.create('projectOne', [
          WorkflowModelFactory.create('workflowOne', undefined, undefined, undefined, undefined, undefined),
        ]),
        ProjectModelFactory.create('projectTwo', [
          WorkflowModelFactory.create('workflowTwo', undefined, undefined, undefined, undefined, undefined),
        ]),
      ],
    },
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [provideMockStore({ initialState: initialAppState })],
        declarations: [WorkflowsComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowsComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it(
    'should after view init set component properties',
    waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(underTest.loading).toBe(initialAppState.workflows.loading);
        expect(underTest.projects).toBeDefined();
      });
    }),
  );
});
