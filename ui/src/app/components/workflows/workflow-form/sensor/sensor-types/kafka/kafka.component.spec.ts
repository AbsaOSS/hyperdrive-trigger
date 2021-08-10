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
import { KafkaComponent } from './kafka.component';
import { WorkflowEntryModelFactory } from '../../../../../../models/workflowEntry.model';
import { WorkflowSensorChanged } from '../../../../../../stores/workflows/workflows.actions';

describe('KafkaComponent', () => {
  let fixture: ComponentFixture<KafkaComponent>;
  let underTest: KafkaComponent;

  const sensorData = [
    { property: 'propertyOne', value: 'valueOne' },
    { property: 'propertyTwo', value: 'valueTwo' },
    { property: 'switchPartProp', value: 'optionTwo' },
  ];

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [KafkaComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(KafkaComponent);
    underTest = fixture.componentInstance;

    //set test data
    underTest.sensorData = sensorData;
    underTest.changes = new Subject<Action>();
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it(
    'should dispatch workflow sensor change when value is received',
    waitForAsync(() => {
      const usedWorkflowEntry = WorkflowEntryModelFactory.create('property', 'value');
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const storeSpy = spyOn(underTest.changes, 'next');
        underTest.sensorChanges.next(usedWorkflowEntry);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(storeSpy).toHaveBeenCalledTimes(1);
          expect(storeSpy).toHaveBeenCalledWith(new WorkflowSensorChanged(usedWorkflowEntry));
        });
      });
    }),
  );
});
