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

import { Subject } from 'rxjs';
import { Action } from '@ngrx/store';
import { ShellComponent } from './shell.component';
import { WorkflowEntryModelFactory } from '../../../../../../../models/workflowEntry.model';
import { WorkflowJobChanged } from '../../../../../../../stores/workflows/workflows.actions';

describe('ShellComponent', () => {
  let fixture: ComponentFixture<ShellComponent>;
  let underTest: ShellComponent;

  const jobData = [
    { property: 'propertyOne', value: 'valueOne' },
    { property: 'propertyTwo', value: 'valueTwo' },
    { property: 'switchPartProp', value: 'optionTwo' },
  ];
  const jobId = '1';

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ShellComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ShellComponent);
    underTest = fixture.componentInstance;

    //set test data
    underTest.jobData = jobData;
    underTest.jobId = jobId;
    underTest.changes = new Subject<Action>();
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it(
    'should dispatch job change when value is received',
    waitForAsync(() => {
      const usedWorkflowEntry = WorkflowEntryModelFactory.create('property', 'value');
      const usedJobId = '1';
      const workflowSensorChangedPayload = { jobId: usedJobId, jobEntry: usedWorkflowEntry };

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const storeSpy = spyOn(underTest.changes, 'next');
        underTest.jobChanges.next(usedWorkflowEntry);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(storeSpy).toHaveBeenCalledTimes(1);
          expect(storeSpy).toHaveBeenCalledWith(new WorkflowJobChanged(workflowSensorChangedPayload));
        });
      });
    }),
  );
});
