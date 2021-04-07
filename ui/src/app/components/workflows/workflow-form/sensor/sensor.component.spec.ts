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
import {
  DynamicFormPartFactory,
  DynamicFormPartsFactory,
  FormPartFactory,
  PartValidationFactory,
  WorkflowFormPartsModelFactory,
} from '../../../../models/workflowFormParts.model';
import { WorkflowSensorChanged, WorkflowSensorTypeSwitched } from '../../../../stores/workflows/workflows.actions';
import { WorkflowEntryModelFactory } from '../../../../models/workflowEntry.model';
import { Subject } from 'rxjs';
import { Action } from '@ngrx/store';

describe('SensorComponent', () => {
  let fixture: ComponentFixture<SensorComponent>;
  let underTest: SensorComponent;

  const sensorData = [
    { property: 'propertyOne', value: 'valueOne' },
    { property: 'propertyTwo', value: 'valueTwo' },
    { property: 'switchPartProp', value: 'optionTwo' },
  ];
  const workflowFormParts = WorkflowFormPartsModelFactory.create(
    [],
    FormPartFactory.create(
      'switchPartName',
      'switchPartProp',
      'switchPartType',
      PartValidationFactory.create(true),
      new Map([
        ['optionOne', 'optionOne'],
        ['optionTwo', 'optionTwoLabel'],
      ]),
    ),
    undefined,
    undefined,
    DynamicFormPartsFactory.create(
      [
        DynamicFormPartFactory.create('optionOne', [
          FormPartFactory.create('partOne', 'partOne', 'partOne', PartValidationFactory.create(true)),
        ]),
        DynamicFormPartFactory.createWithLabel('optionTwo', 'optionTwoLabel', [
          FormPartFactory.create('partTwo', 'partTwo', 'partTwo', PartValidationFactory.create(true)),
        ]),
      ],
      [],
    ),
  );

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
    underTest.workflowFormParts = workflowFormParts;
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
      const usedWorkflowEntry = WorkflowEntryModelFactory.create(workflowFormParts.sensorSwitchPart.property, 'value');

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
    'getSensorTypes() should return sensor types',
    waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const result = underTest.getSensorTypes();
        expect(result).toEqual(workflowFormParts.sensorSwitchPart.options);
      });
    }),
  );

  it(
    'getSelectedSensorComponent() should return first dynamic parts when no sensor is selected',
    waitForAsync(() => {
      underTest.sensorData = [];
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const resultLeft = underTest.getSelectedSensorComponent();
        const resultRight = workflowFormParts.dynamicParts.sensorDynamicParts[0].parts;

        expect(resultLeft).toEqual(resultRight);
      });
    }),
  );

  it(
    'getSelectedSensorComponent() should return dynamic parts when sensor is selected',
    waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const resultLeft = underTest.getSelectedSensorComponent();
        const resultRight = workflowFormParts.dynamicParts.sensorDynamicParts[1].parts;

        expect(resultLeft).toEqual(resultRight);
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
