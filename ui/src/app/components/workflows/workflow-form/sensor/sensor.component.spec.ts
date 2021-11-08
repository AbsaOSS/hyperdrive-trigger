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

import { SensorComponent } from './sensor.component';
import { WorkflowSensorChanged, WorkflowSensorTypeSwitched } from '../../../../stores/workflows/workflows.actions';
import { WorkflowEntryModelFactory } from '../../../../models/workflowEntry.model';
import { Subject } from 'rxjs';
import { Action } from '@ngrx/store';
import { sensorTypes } from '../../../../constants/sensorTypes.constants';

describe('SensorComponent', () => {
  let fixture: ComponentFixture<SensorComponent>;
  let underTest: SensorComponent;

  const sensorData = [
    { property: 'propertyOne', value: 'valueOne' },
    { property: 'propertyTwo', value: 'valueTwo' },
    { property: 'properties.sensorType', value: 'optionTwo' },
  ];

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SensorComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorComponent);
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

  it(
    'should dispatch workflow sensor type switch when value for switch is received',
    waitForAsync(() => {
      const usedWorkflowEntry = WorkflowEntryModelFactory.create(underTest.SENSOR_TYPE_PROPERTY, 'value');

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const storeSpy = spyOn(underTest.changes, 'next');
        underTest.sensorChanges.next(usedWorkflowEntry);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(storeSpy).toHaveBeenCalledTimes(1);
          expect(storeSpy).toHaveBeenCalledWith(new WorkflowSensorTypeSwitched(usedWorkflowEntry));
        });
      });
    }),
  );

  it(
    'getSelectedSensorType() should return absa-kafka sensor type when no sensor is selected',
    waitForAsync(() => {
      underTest.sensorData = [];
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const resultLeft = underTest.getSelectedSensorType();

        expect(resultLeft).toEqual(sensorTypes.ABSA_KAFKA);
      });
    }),
  );

  it(
    'getSelectedSensorType() should return sensor type when sensor is selected',
    waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const resultLeft = underTest.getSelectedSensorType();
        const resultRight = sensorData[2].value;

        expect(resultLeft).toEqual(resultRight);
      });
    }),
  );
});
