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

import { SensorComponent } from './sensor.component';
import { provideMockStore } from '@ngrx/store/testing';
import { DynamicFormPart, DynamicFormParts, FormPart, WorkflowFormPartsModel } from '../../../../models/workflowFormParts.model';

describe('SensorComponent', () => {
  let fixture: ComponentFixture<SensorComponent>;
  let underTest: SensorComponent;

  const initialAppState = {
    workflows: {
      workflowFormParts: new WorkflowFormPartsModel(
        [],
        new FormPart('switchPartName', 'switchPartProp', true, 'switchPartType', ['optionOne', 'optionTwo']),
        undefined,
        undefined,
        new DynamicFormParts(
          [
            new DynamicFormPart('optionOne', [new FormPart('partOne', 'partOne', true, 'partOne')]),
            new DynamicFormPart('optionTwo', [new FormPart('partTwo', 'partTwo', true, 'partTwo')]),
          ],
          [],
        ),
      ),
      workflowAction: {
        mode: 'mode',
        workflowData: {
          sensor: [
            { property: 'propertyOne', value: 'valueOne' },
            { property: 'propertyTwo', value: 'valueTwo' },
            { property: 'switchPartProp', value: 'optionOne' },
          ],
        },
      },
    },
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({ initialState: initialAppState })],
      declarations: [SensorComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it('getValue() should return value when property exists', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const queriedDetail = initialAppState.workflows.workflowAction.workflowData.sensor[0];
      expect(underTest.getValue(queriedDetail.property)).toBe(queriedDetail.value);
    });
  }));

  it('getValue() should return undefined when property doesnt exists', async(() => {
    const undefinedProperty = 'undefinedProperty';

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.getValue(undefinedProperty)).toBe(undefined);
    });
  }));

  it('getSensorTypes() should return sensor types', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const result = underTest.getSensorTypes();
      expect(result).toEqual(initialAppState.workflows.workflowFormParts.sensorSwitchPart.options);
    });
  }));

  it('getSelectedSensorComponent() should return first dynamic parts when no sensor is selected', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const resultLeft = underTest.getSelectedSensorComponent();
      const resultRight = initialAppState.workflows.workflowFormParts.dynamicParts.sensorDynamicParts[0].parts;

      expect(resultLeft).toEqual(resultRight);
    });
  }));

  it('getSelectedSensorComponent() should return dynamic parts when sensor is selected', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      underTest.selectedSensor = initialAppState.workflows.workflowFormParts.dynamicParts.sensorDynamicParts[1].name;
      const resultLeft = underTest.getSelectedSensorComponent();
      const resultRight = initialAppState.workflows.workflowFormParts.dynamicParts.sensorDynamicParts[1].parts;

      expect(resultLeft).toEqual(resultRight);
    });
  }));
});
