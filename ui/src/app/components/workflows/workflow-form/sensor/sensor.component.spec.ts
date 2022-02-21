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
import { SensorModelFactory } from '../../../../models/sensor.model';
import { KafkaSensorProperties, RecurringSensorProperties } from '../../../../models/sensorProperties.model';

describe('SensorComponent', () => {
  let fixture: ComponentFixture<SensorComponent>;
  let underTest: SensorComponent;

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
    underTest.sensor = SensorModelFactory.createEmptyWithParams(KafkaSensorProperties.createEmpty());
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it('should emit updated sensor when sensorPropertiesChange() is called', () => {
    const newSensorProperties = { ...underTest.sensor.properties, topic: 'newTopicName' };
    const newSensor = { ...underTest.sensor, properties: newSensorProperties };

    spyOn(underTest.sensorChange, 'emit');
    underTest.sensorPropertiesChange(newSensorProperties);

    expect(underTest.sensorChange.emit).toHaveBeenCalled();
    expect(underTest.sensorChange.emit).toHaveBeenCalledWith(newSensor);
  });

  it('should emit updated sensor with empty parameters when sensorTypeChange() is called', () => {
    const newSensorProperties = RecurringSensorProperties.createEmpty();
    const newSensor = { ...underTest.sensor, properties: newSensorProperties };

    spyOn(underTest.sensorChange, 'emit');
    underTest.sensorTypeChange(newSensorProperties.sensorType);

    expect(underTest.sensorChange.emit).toHaveBeenCalled();
    expect(underTest.sensorChange.emit).toHaveBeenCalledWith(newSensor);
  });
});
