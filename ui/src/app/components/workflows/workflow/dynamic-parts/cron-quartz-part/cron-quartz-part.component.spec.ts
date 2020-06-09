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
// import { userFriendly } from '../../../../../constants/cronExpressionOptions.constants';

describe('CronQuartzPartComponent', () => {
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

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
  //
  // describe('ngOnInit', () => {
  //   it('should set default cron expression when value is undefined', () => {
  //     const underTest = fixture.componentInstance;
  //     underTest.valueChanges = new Subject<WorkflowEntryModel>();
  //     underTest.value = undefined;
  //     const expectedMinuteCron = ['0', '0', '0', '?', '*', '*', '*'];
  //     underTest.ngOnInit();
  //
  //     expect(underTest.cron.join('')).toEqual(expectedMinuteCron.join(''));
  //   });
  //
  //   it('should set default cron, set validCron to false when value is not valid', () => {
  //     const underTest = fixture.componentInstance;
  //     underTest.valueChanges = new Subject<WorkflowEntryModel>();
  //     underTest.value = 'invalid-cron-expression';
  //     const expectedMinuteCron = ['0', '0', '0', '?', '*', '*', '*'];
  //     underTest.ngOnInit();
  //
  //     expect(underTest.cron.join('')).toEqual(expectedMinuteCron.join(''));
  //     expect(underTest.validCron).toBeFalsy();
  //   });
  //
  //   it('should set default cron, set validCron to true when value is valid', () => {
  //     const underTest = fixture.componentInstance;
  //     underTest.valueChanges = new Subject<WorkflowEntryModel>();
  //     underTest.value = '0 18 0 ? * * *';
  //     underTest.ngOnInit();
  //
  //     expect(underTest.validCron).toBeTruthy();
  //   });
  // });
  //
  // describe('fromCron', () => {
  //   it('should set correct base, minute. hour and day values on Hour every cron expression', () => {
  //     const underTest = fixture.componentInstance;
  //     underTest.valueChanges = new Subject<WorkflowEntryModel>();
  //     underTest.value = '0 0/10 * ? * * *';
  //     underTest.ngOnInit();
  //     underTest.fromCron(underTest.value);
  //
  //     expect(underTest.base).toEqual(userFriendly.OPTIONS[0].value);
  //     expect(underTest.minuteValue).toEqual(10);
  //     expect(underTest.hourValue).toMatch('undefined');
  //     expect(underTest.dayValue).toMatch('undefined');
  //   });
  //
  //   it('should set correct base, minute. hour and day values on Hour at cron expression', () => {
  //     const underTest = fixture.componentInstance;
  //     underTest.valueChanges = new Subject<WorkflowEntryModel>();
  //     underTest.value = '0 15 * ? * * *';
  //     underTest.ngOnInit();
  //     underTest.fromCron(underTest.value);
  //
  //     expect(underTest.base).toEqual(userFriendly.OPTIONS[1].value);
  //     expect(underTest.minuteValue).toMatch('undefined');
  //     expect(underTest.hourValue).toEqual(15);
  //     expect(underTest.dayValue).toMatch('undefined');
  //   });
  //
  //   it('should set correct base, minute. hour and day values on Day cron expression', () => {
  //     const underTest = fixture.componentInstance;
  //     underTest.valueChanges = new Subject<WorkflowEntryModel>();
  //     underTest.value = '0 0 18 ? * * *';
  //     underTest.ngOnInit();
  //     underTest.fromCron(underTest.value);
  //
  //     expect(underTest.base).toEqual(userFriendly.OPTIONS[2].value);
  //     expect(underTest.minuteValue).toMatch('undefined');
  //     expect(underTest.hourValue).toMatch('undefined');
  //     expect(underTest.dayMinuteValue).toEqual(0);
  //     expect(underTest.dayValue).toEqual(18);
  //   });
  // });
  //
  // describe('validateCron', () => {
  //   it('should pass on valid cron expressions', () => {
  //     const underTest = fixture.componentInstance;
  //     underTest.valueChanges = new Subject<WorkflowEntryModel>();
  //     underTest.value = '0 0/30 * ? * * *';
  //
  //     expect(underTest.validateCron(underTest.value)).toBeTruthy();
  //   });
  //
  //   it('should fail on invalid cron expressions', () => {
  //     const underTest = fixture.componentInstance;
  //     underTest.valueChanges = new Subject<WorkflowEntryModel>();
  //     underTest.value = '0 /10 * ? * * *';
  //
  //     expect(underTest.validateCron(underTest.value)).toBeFalsy();
  //   });
  // });
  //
  // it('should set default view to user friendly input on readable string length less than 30', () => {
  //   const underTest = fixture.componentInstance;
  //   underTest.valueChanges = new Subject<WorkflowEntryModel>();
  //   underTest.value = '0 0 18 ? * * *';
  //   underTest.checkReadableMessage(underTest.value);
  //
  //   expect(underTest.freq).toEqual(underTest.frequencies[0].value);
  // });
  //
  // it('should set default view to free text cron expression on readable string length not less than 30', () => {
  //   const underTest = fixture.componentInstance;
  //   underTest.valueChanges = new Subject<WorkflowEntryModel>();
  //   underTest.value = '0,17,23,41 0 0 ? * * *';
  //   underTest.checkReadableMessage(underTest.value);
  //
  //   console.log(underTest.freq);
  //   expect(underTest.freq).toEqual(underTest.frequencies[1].value);
  // });
  //
  // it('should set cron for every minutes', () => {
  //   const underTest = fixture.componentInstance;
  //   underTest.valueChanges = new Subject<WorkflowEntryModel>();
  //   const minuteValue = 10;
  //   const expectedMinuteCron = ['0', '0/10', '*', '?', '*', '*', '*'];
  //   underTest.onMinuteSelect(minuteValue);
  //
  //   expect(underTest.cron.join(' ')).toEqual(expectedMinuteCron.join(' '));
  // });
  //
  // it('should set cron for every hour', () => {
  //   const underTest = fixture.componentInstance;
  //   underTest.valueChanges = new Subject<WorkflowEntryModel>();
  //   const hourValue = 20;
  //   const expectedHourCron = ['0', '20', '*', '?', '*', '*', '*'];
  //   underTest.onHourSelect(hourValue);
  //
  //   expect(underTest.cron.join(' ')).toEqual(expectedHourCron.join(' '));
  // });
  //
  // it('should set cron for every day', () => {
  //   const underTest = fixture.componentInstance;
  //   underTest.valueChanges = new Subject<WorkflowEntryModel>();
  //   const dayValue = 18;
  //   const expectedDayCron = ['0', '0', '18', '?', '*', '*', '*'];
  //   underTest.onDaySelect(dayValue);
  //
  //   expect(underTest.cron.join(' ')).toEqual(expectedDayCron.join(' '));
  // });
});
