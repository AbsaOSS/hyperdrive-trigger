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
import { TimeComponent } from './time.component';
import { TimeSensorProperties } from '../../../../../../models/sensorProperties.model';

describe('TimeComponent', () => {
  let fixture: ComponentFixture<TimeComponent>;
  let underTest: TimeComponent;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TimeComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeComponent);
    underTest = fixture.componentInstance;

    //set test data
    underTest.isShow = false;
    underTest.sensorProperties = TimeSensorProperties.createEmpty();
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it('should emit updated properties when runAtChange() is called', () => {
    spyOn(underTest.sensorPropertiesChange, 'emit');
    const newCronExpression = 'newCronExpression';
    const newSensorProperties = { ...underTest.sensorProperties, cronExpression: newCronExpression };

    underTest.runAtChange(newCronExpression);

    expect(underTest.sensorPropertiesChange.emit).toHaveBeenCalled();
    expect(underTest.sensorPropertiesChange.emit).toHaveBeenCalledWith(newSensorProperties);
  });
});
