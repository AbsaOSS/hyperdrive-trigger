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

import { WorkflowDetailsComponent } from './workflow-details.component';
import { WorkflowEntryModelFactory } from '../../../../models/workflowEntry.model';
import { WorkflowDetailsChanged } from '../../../../stores/workflows/workflows.actions';
import { Subject } from 'rxjs';
import { Action } from '@ngrx/store';

describe('WorkflowDetailsComponent', () => {
  let fixture: ComponentFixture<WorkflowDetailsComponent>;
  let underTest: WorkflowDetailsComponent;

  const sensorData = [
    { property: 'propertyOne', value: 'valueOne' },
    { property: 'propertyTwo', value: 'valueTwo' },
  ];
  const parts = [];

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [WorkflowDetailsComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowDetailsComponent);
    underTest = fixture.componentInstance;

    //set test data
    underTest.data = sensorData;
    underTest.parts = parts;
    underTest.changes = new Subject<Action>();
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it(
    'should dispatch workflow details change when value is received',
    waitForAsync(() => {
      const usedWorkflowEntry = WorkflowEntryModelFactory.create('property', 'value');
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const storeSpy = spyOn(underTest.changes, 'next');
        underTest.detailsChanges.next(usedWorkflowEntry);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(storeSpy).toHaveBeenCalledTimes(1);
          expect(storeSpy).toHaveBeenCalledWith(new WorkflowDetailsChanged(usedWorkflowEntry));
        });
      });
    }),
  );

  it(
    'getValue() should return value when property exists',
    waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const queriedDetail = sensorData[0];
        expect(underTest.getValue(queriedDetail.property)).toBe(queriedDetail.value);
      });
    }),
  );

  it(
    'getValue() should return undefined when property does not exist',
    waitForAsync(() => {
      const undefinedProperty = 'undefinedProperty';

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(underTest.getValue(undefinedProperty)).toBe(undefined);
      });
    }),
  );
});
