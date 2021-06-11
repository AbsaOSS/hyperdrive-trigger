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

import { ComboboxPartComponent } from './combobox-part.component';
import { DebugElement, Predicate } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule, NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../../../../models/workflowEntry.model';
import { PartValidationFactory } from '../../../../../models/workflowFormParts.model';

describe('ComboboxPartComponent', () => {
  let fixture: ComponentFixture<ComboboxPartComponent>;
  let underTest: ComboboxPartComponent;

  const inputSelector: Predicate<DebugElement> = By.css('clr-combobox');

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ComboboxPartComponent],
        imports: [FormsModule],
        providers: [NgForm],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ComboboxPartComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  // directly test modelChanged method
  // it(
  //   'should change value and publish change on user input',
  //   waitForAsync(() => {
  //     const oldValue = 'oneValue';
  //     const newValue1 = 'threeValue';
  //     const newValue2 = 'fourValue';
  //     const propertyName = 'property';
  //     const options = new Map([
  //       [oldValue, 'oneLabel'],
  //       ['two', 'two'],
  //       [newValue1, 'threeLabel'],
  //       [newValue2, 'fourLabel'],
  //     ]);
  //
  //     const testedSubject = new Subject<WorkflowEntryModel>();
  //     const subjectSpy = spyOn(testedSubject, 'next');
  //     const partValidation = PartValidationFactory.create(true);
  //
  //     underTest.isShow = false;
  //     underTest.name = 'name';
  //     underTest.value = [oldValue];
  //     underTest.property = propertyName;
  //     underTest.options = options;
  //     underTest.valueChanges = testedSubject;
  //     underTest.partValidation = partValidation;
  //
  //     fixture.detectChanges();
  //     fixture.whenStable().then(() => {
  //       const inputElement = fixture.debugElement.query(inputSelector).nativeElement;
  //       inputElement.attributes['ng-reflect-model'] = [newValue1, newValue2];
  //       inputElement.dispatchEvent(new Event('change'));
  //
  //       fixture.detectChanges();
  //       fixture.whenStable().then(() => {
  //         const testedValue = fixture.debugElement.query(inputSelector).nativeElement.attributes['ng-reflect-model'];
  //         expect(testedValue).toEqual([newValue1, newValue2]);
  //         expect(subjectSpy).toHaveBeenCalled();
  //         expect(subjectSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(propertyName, [newValue1, newValue2]));
  //       });
  //     });
  //   }),
  // );
});
