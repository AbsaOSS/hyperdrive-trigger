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

import { KeyStringValuePartComponent } from './key-string-value-part.component';
import { DebugElement, Predicate } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { WorkflowEntryModel } from '../../../../../models/workflowEntry.model';

describe('KeyStringValuePartComponent', () => {
  let fixture: ComponentFixture<KeyStringValuePartComponent>;
  let underTest: KeyStringValuePartComponent;

  const inputSelector: Predicate<DebugElement> = By.css('input[type="text"]');

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KeyStringValuePartComponent],
      imports: [FormsModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyStringValuePartComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  // describe('should set array with empty string on init when value is undefined or null', () => {
  //   const parameters = [null, undefined];
  //
  //   parameters.forEach((parameter) => {
  //     it(
  //       'should pass with ' + parameter + ' value',
  //       async(() => {
  //         const oldValue = parameter;
  //         const newValue = [['', '']];
  //         const propertyName = 'property';
  //         const testedSubject = new Subject<WorkflowEntryModel>();
  //         const subjectSpy = spyOn(testedSubject, 'next');
  //
  //         underTest.isShow = false;
  //         underTest.name = 'name';
  //         underTest.value = oldValue;
  //         underTest.property = propertyName;
  //         underTest.valueChanges = testedSubject;
  //         fixture.detectChanges();
  //
  //         fixture.whenStable().then(() => {
  //           const results = fixture.debugElement.queryAll(inputSelector);
  //           expect(results.length == 2).toBeTrue();
  //           expect(results[0].nativeElement.value).toBe(newValue[0][0]);
  //           expect(results[1].nativeElement.value).toBe(newValue[0][1]);
  //           expect(subjectSpy).toHaveBeenCalledTimes(1);
  //           expect(subjectSpy).toHaveBeenCalledWith(new WorkflowEntryModel(propertyName, newValue));
  //         });
  //       }),
  //     );
  //   });
  // });
  //
  // it('should change key and publish change on user input', async(() => {
  //   const oldItemKey = 'oldKey';
  //   const oldItemValue = 'oldValue';
  //   const newItemKey = 'newKey';
  //   const oldValue: [string, string][] = [
  //     ['keyOne', 'valueOne'],
  //     [oldItemKey, oldItemValue],
  //     ['keyThree', 'valueThree'],
  //   ];
  //   const newValue: [string, string][] = [
  //     ['keyOne', 'valueOne'],
  //     [newItemKey, oldItemValue],
  //     ['keyThree', 'valueThree'],
  //   ];
  //
  //   const propertyName = 'property';
  //   const testedSubject = new Subject<WorkflowEntryModel>();
  //   const subjectSpy = spyOn(testedSubject, 'next');
  //
  //   underTest.isShow = false;
  //   underTest.name = 'name';
  //   underTest.value = oldValue;
  //   underTest.property = propertyName;
  //   underTest.valueChanges = testedSubject;
  //
  //   fixture.detectChanges();
  //   fixture.whenStable().then(() => {
  //     const inputElement = fixture.debugElement.queryAll(inputSelector)[2];
  //
  //     inputElement.nativeElement.value = newItemKey;
  //     inputElement.nativeElement.dispatchEvent(new Event('input'));
  //
  //     fixture.detectChanges();
  //     fixture.whenStable().then(() => {
  //       const testedValue = fixture.debugElement.queryAll(inputSelector)[2].nativeElement.value;
  //       expect(testedValue).toBe(newItemKey);
  //       expect(subjectSpy).toHaveBeenCalled();
  //       expect(subjectSpy).toHaveBeenCalledWith(new WorkflowEntryModel(propertyName, newValue));
  //     });
  //   });
  // }));
  //
  // it('should change value and publish change on user input', async(() => {
  //   const oldItemKey = 'oldKey';
  //   const oldItemValue = 'oldValue';
  //   const newItemValue = 'newValue';
  //   const oldValue: [string, string][] = [
  //     ['keyOne', 'valueOne'],
  //     [oldItemKey, oldItemValue],
  //     ['keyThree', 'valueThree'],
  //   ];
  //   const newValue: [string, string][] = [
  //     ['keyOne', 'valueOne'],
  //     [oldItemKey, newItemValue],
  //     ['keyThree', 'valueThree'],
  //   ];
  //
  //   const propertyName = 'property';
  //   const testedSubject = new Subject<WorkflowEntryModel>();
  //   const subjectSpy = spyOn(testedSubject, 'next');
  //
  //   underTest.isShow = false;
  //   underTest.name = 'name';
  //   underTest.value = oldValue;
  //   underTest.property = propertyName;
  //   underTest.valueChanges = testedSubject;
  //
  //   fixture.detectChanges();
  //   fixture.whenStable().then(() => {
  //     const inputElement = fixture.debugElement.queryAll(inputSelector)[3];
  //
  //     inputElement.nativeElement.value = newItemValue;
  //     inputElement.nativeElement.dispatchEvent(new Event('input'));
  //
  //     fixture.detectChanges();
  //     fixture.whenStable().then(() => {
  //       const testedValue = fixture.debugElement.queryAll(inputSelector)[3].nativeElement.value;
  //       expect(testedValue).toBe(newItemValue);
  //       expect(subjectSpy).toHaveBeenCalled();
  //       expect(subjectSpy).toHaveBeenCalledWith(new WorkflowEntryModel(propertyName, newValue));
  //     });
  //   });
  // }));
  //
  // it('onDelete() should remove element from value and publish change', async(() => {
  //   const oldValue: [string, string][] = [
  //     ['keyOne', 'valueOne'],
  //     ['keyTwo', 'valueTwo'],
  //     ['keyThree', 'valueThree'],
  //   ];
  //   const newValue: [string, string][] = [
  //     ['keyOne', 'valueOne'],
  //     ['keyThree', 'valueThree'],
  //   ];
  //   const propertyName = 'property';
  //   const testedSubject = new Subject<WorkflowEntryModel>();
  //   const subjectSpy = spyOn(testedSubject, 'next');
  //
  //   underTest.isShow = false;
  //   underTest.name = 'name';
  //   underTest.value = oldValue;
  //   underTest.property = propertyName;
  //   underTest.valueChanges = testedSubject;
  //
  //   fixture.detectChanges();
  //   fixture.whenStable().then(() => {
  //     underTest.onDelete(1);
  //
  //     fixture.detectChanges();
  //     fixture.whenStable().then(() => {
  //       expect(subjectSpy).toHaveBeenCalled();
  //       expect(subjectSpy).toHaveBeenCalledWith(new WorkflowEntryModel(propertyName, newValue));
  //     });
  //   });
  // }));
  //
  // it('onAdd() should add empty string key value element to value and publish change', async(() => {
  //   const oldValue: [string, string][] = [
  //     ['keyOne', 'valueOne'],
  //     ['keyTwo', 'valueTwo'],
  //   ];
  //   const newValue: [string, string][] = [
  //     ['keyOne', 'valueOne'],
  //     ['keyTwo', 'valueTwo'],
  //     ['', ''],
  //   ];
  //   const propertyName = 'property';
  //   const testedSubject = new Subject<WorkflowEntryModel>();
  //   const subjectSpy = spyOn(testedSubject, 'next');
  //
  //   underTest.isShow = false;
  //   underTest.name = 'name';
  //   underTest.value = oldValue;
  //   underTest.property = propertyName;
  //   underTest.valueChanges = testedSubject;
  //
  //   fixture.detectChanges();
  //   fixture.whenStable().then(() => {
  //     underTest.onAdd();
  //
  //     fixture.detectChanges();
  //     fixture.whenStable().then(() => {
  //       expect(subjectSpy).toHaveBeenCalled();
  //       expect(subjectSpy).toHaveBeenCalledWith(new WorkflowEntryModel(propertyName, newValue));
  //     });
  //   });
  // }));
});
