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

import { StringSequencePartComponent } from './string-sequence-part.component';
import { DebugElement, Predicate } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule, NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../../../../models/workflowEntry.model';
import { PartValidation, PartValidationFactory } from '../../../../../models/workflowFormParts.model';

describe('StringSequencePartComponent', () => {
  let fixture: ComponentFixture<StringSequencePartComponent>;
  let underTest: StringSequencePartComponent;

  const inputSelector: Predicate<DebugElement> = By.css('input[type="text"]');

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [StringSequencePartComponent],
        imports: [FormsModule],
        providers: [NgForm],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(StringSequencePartComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  describe('should set array with empty string on init when value is undefined or null', () => {
    const parameters = [null, undefined];

    parameters.forEach((parameter) => {
      it(
        'should pass with ' + parameter + ' value',
        waitForAsync(() => {
          const oldValue = parameter;
          const newValue = [''];
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
            const results = fixture.debugElement.queryAll(inputSelector);
            expect(results.length == 1).toBeTrue();
            expect(results[0].nativeElement.value).toBe(newValue[0]);
            expect(subjectSpy).toHaveBeenCalledTimes(1);
            expect(subjectSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(propertyName, newValue));
          });
        }),
      );
    });
  });

  it(
    'should change value and publish change on user input',
    waitForAsync(() => {
      const oldItem = 'two';
      const newItem = 'changed';
      const oldValue = ['one', oldItem, 'three'];
      const newValue = ['one', newItem, 'three'];
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
        const inputElement = fixture.debugElement.queryAll(inputSelector)[1];

        inputElement.nativeElement.value = newItem;
        inputElement.nativeElement.dispatchEvent(new Event('input'));

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          const testedValue = fixture.debugElement.queryAll(inputSelector)[1].nativeElement.value;
          expect(testedValue).toBe(newItem);
          expect(subjectSpy).toHaveBeenCalled();
          expect(subjectSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(propertyName, newValue));
        });
      });
    }),
  );

  it(
    'onDeleteValue() should remove element from value and publish change',
    waitForAsync(() => {
      const oldValue = ['one', 'two', 'three'];
      const newValue = ['one', 'three'];
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
        underTest.onDeleteValue(1);

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          const testedValue = fixture.debugElement.queryAll(inputSelector);
          const result = testedValue.map((element) => element.nativeElement.value);
          expect(result).toEqual(newValue);
          expect(subjectSpy).toHaveBeenCalled();
          expect(subjectSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(propertyName, newValue));
        });
      });
    }),
  );

  it(
    'onAddValue() should add empty string to value and publish change',
    waitForAsync(() => {
      const oldValue = ['one', 'two'];
      const newValue = ['one', 'two', ''];
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
        underTest.onAddValue();

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          const testedValue = fixture.debugElement.queryAll(inputSelector);
          const result = testedValue.map((element) => element.nativeElement.value);
          expect(result).toEqual(newValue);
          expect(subjectSpy).toHaveBeenCalled();
          expect(subjectSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(propertyName, newValue));
        });
      });
    }),
  );
});
