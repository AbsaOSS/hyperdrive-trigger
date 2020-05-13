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

describe('CronQuartzPartComponent', () => {
  let component: CronQuartzPartComponent;
  let fixture: ComponentFixture<CronQuartzPartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CronQuartzPartComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CronQuartzPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set cron for every minutes', () => {
    const underTest = fixture.componentInstance;
    underTest.valueChanges = new Subject<WorkflowEntryModel>();
    const minuteValue = 10;
    const expectedMinuteCron = ['0', '0/10', '0', '?', '*', '*', '*'];
    underTest.onMinuteSelect(minuteValue);

    expect(underTest.cron.join(' ')).toEqual(expectedMinuteCron.join(' '));
  });

  it('should set cron for every hour', () => {
    const underTest = fixture.componentInstance;
    underTest.valueChanges = new Subject<WorkflowEntryModel>();
    const hourValue = 20;
    const expectedHourCron = ['0', '20', '0', '?', '*', '*', '*'];
    underTest.onHourSelect(hourValue);

    expect(underTest.cron.join(' ')).toEqual(expectedHourCron.join(' '));
  });

  it('should set cron for every day', () => {
    const underTest = fixture.componentInstance;
    underTest.valueChanges = new Subject<WorkflowEntryModel>();
    const dayValue = 30;
    const expectedDayCron = ['0', '0', '30', '?', '*', '*', '*'];
    underTest.onDaySelect(dayValue);

    expect(underTest.cron.join(' ')).toEqual(expectedDayCron.join(' '));
  });
});
