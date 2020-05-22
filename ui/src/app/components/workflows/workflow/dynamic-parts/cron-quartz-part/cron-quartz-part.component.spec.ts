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
import { Subject } from 'rxjs';

import { CronQuartzPartComponent } from './cron-quartz-part.component';
import { WorkflowEntryModel } from '../../../../../models/workflowEntry.model';
import { sensorFrequency } from '../../../../../constants/cronExpressionOptions.constants';

fdescribe('CronQuartzPartComponent', () => {
  let fixture: ComponentFixture<CronQuartzPartComponent>;
  let component: CronQuartzPartComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CronQuartzPartComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CronQuartzPartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set default cron expression on init when value is undefined', () => {
    const underTest = fixture.componentInstance;
    underTest.valueChanges = new Subject<WorkflowEntryModel>();
    underTest.value = undefined;
    const expectedMinuteCron = ['0', '0', '0', '?', '*', '*', '*'];
    underTest.ngOnInit();

    expect(underTest.cron.join('')).toEqual(expectedMinuteCron.join(''));
  });

  describe('fromCron', () => {
    it('should set correct base, minute. hour and day values on Hour every cron expression', () => {
      const underTest = fixture.componentInstance;
      underTest.valueChanges = new Subject<WorkflowEntryModel>();
      underTest.value = '0 0/10 * ? * * *';
      underTest.ngOnInit();
      underTest.fromCron(underTest.value);

      expect(underTest.base).toEqual(sensorFrequency.FREQUENCIES[0].value);
      expect(underTest.minuteValue).toEqual(10);
      expect(underTest.hourValue).toMatch('undefined');
      expect(underTest.dayValue).toMatch('undefined');
    });

    it('should set correct base, minute. hour and day values on Hour at cron expression', () => {
      const underTest = fixture.componentInstance;
      underTest.valueChanges = new Subject<WorkflowEntryModel>();
      underTest.value = '0 15 0 ? * * *';
      underTest.ngOnInit();
      underTest.fromCron(underTest.value);

      expect(underTest.base).toEqual(sensorFrequency.FREQUENCIES[1].value);
      expect(underTest.minuteValue).toMatch('undefined');
      expect(underTest.hourValue).toEqual(15);
      expect(underTest.dayValue).toMatch('undefined');
    });

    it('should set correct base, minute. hour and day values on Day cron expression', () => {
      const underTest = fixture.componentInstance;
      underTest.valueChanges = new Subject<WorkflowEntryModel>();
      underTest.value = '0 0 18 ? * * *';
      underTest.ngOnInit();
      underTest.fromCron(underTest.value);

      expect(underTest.base).toEqual(sensorFrequency.FREQUENCIES[2].value);
      expect(underTest.minuteValue).toMatch('undefined');
      expect(underTest.hourValue).toMatch('undefined');
      expect(underTest.dayValue).toEqual(18);
    });
  });

  it('should set cron for every minutes', () => {
    const underTest = fixture.componentInstance;
    underTest.valueChanges = new Subject<WorkflowEntryModel>();
    const minuteValue = 10;
    const expectedMinuteCron = ['0', '0/10', '*', '?', '*', '*', '*'];
    underTest.onMinuteSelect(minuteValue);

    expect(underTest.cron.join(' ')).toEqual(expectedMinuteCron.join(' '));
  });

  it('should set cron for every hour', () => {
    const underTest = fixture.componentInstance;
    underTest.valueChanges = new Subject<WorkflowEntryModel>();
    const hourValue = 20;
    const expectedHourCron = ['0', '20', '*', '?', '*', '*', '*'];
    underTest.onHourSelect(hourValue);

    expect(underTest.cron.join(' ')).toEqual(expectedHourCron.join(' '));
  });

  it('should set cron for every day', () => {
    const underTest = fixture.componentInstance;
    underTest.valueChanges = new Subject<WorkflowEntryModel>();
    const dayValue = 18;
    const expectedDayCron = ['0', '0', '18', '?', '*', '*', '*'];
    underTest.onDaySelect(dayValue);

    expect(underTest.cron.join(' ')).toEqual(expectedDayCron.join(' '));
  });
});
