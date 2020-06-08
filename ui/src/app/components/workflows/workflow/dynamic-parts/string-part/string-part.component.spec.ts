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

import { StringPartComponent } from './string-part.component';
import { Subject } from 'rxjs';
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../../../../models/workflowEntry.model';
import { By } from '@angular/platform-browser';
import { DebugElement, Predicate } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { PartValidationFactory } from '../../../../../models/workflowFormParts.model';

describe('StringPartComponent', () => {
  let fixture: ComponentFixture<StringPartComponent>;
  let underTest: StringPartComponent;

  const inputSelector: Predicate<DebugElement> = By.css('input[type="text"]');

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StringPartComponent],
      imports: [FormsModule],
      providers: [NgForm],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StringPartComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  describe('should set empty string on init when value is undefined or null', () => {
    const parameters = [null, undefined];

    parameters.forEach((parameter) => {
      it(
        'should pass with ' + parameter + ' value',
        async(() => {
          const oldValue = parameter;
          const newValue = '';
          const propertyName = 'property';
          const partValidation = PartValidationFactory.create(true, 5, 50);
          const testedSubject = new Subject<WorkflowEntryModel>();
          const subjectSpy = spyOn(testedSubject, 'next');

          underTest.isShow = false;
          underTest.name = 'name';
          underTest.value = oldValue;
          underTest.property = propertyName;
          underTest.valueChanges = testedSubject;
          underTest.partValidation = partValidation;
          fixture.detectChanges();

          fixture.whenStable().then(() => {
            const result = fixture.debugElement.query(inputSelector).nativeElement.value;
            expect(result).toBe(newValue);
            expect(subjectSpy).toHaveBeenCalledTimes(1);
            expect(subjectSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(propertyName, newValue));
          });
        }),
      );
    });
  });

  it('should change value and publish change on user input', async(() => {
    const oldValue = 'oldValue';
    const newValue = 'newValue';
    const propertyName = 'property';
    const testedSubject = new Subject<WorkflowEntryModel>();
    const subjectSpy = spyOn(testedSubject, 'next');
    const partValidation = PartValidationFactory.create(true, 5, 50);

    underTest.isShow = false;
    underTest.name = 'name';
    underTest.value = oldValue;
    underTest.property = propertyName;
    underTest.valueChanges = testedSubject;
    underTest.partValidation = partValidation;

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const inputElement = fixture.debugElement.query(inputSelector).nativeElement;

      inputElement.value = newValue;
      inputElement.dispatchEvent(new Event('input'));

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const testedValue = fixture.debugElement.query(inputSelector).nativeElement.value;
        expect(testedValue).toBe(newValue);
        expect(subjectSpy).toHaveBeenCalled();
        expect(subjectSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(propertyName, newValue));
      });
    });
  }));
});
