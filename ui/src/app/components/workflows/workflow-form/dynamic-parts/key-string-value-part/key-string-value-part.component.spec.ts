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

import { KeyStringValuePartComponent } from './key-string-value-part.component';
import { DebugElement, Predicate } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule, NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../../../../models/workflowEntry.model';
import set from 'lodash/set';
import { PartValidationFactory } from '../../../../../models/workflowFormParts.model';

describe('KeyStringValuePartComponent', () => {
  let fixture: ComponentFixture<KeyStringValuePartComponent>;
  let underTest: KeyStringValuePartComponent;

  const inputSelector: Predicate<DebugElement> = By.css('input[type="text"]');

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [KeyStringValuePartComponent],
        imports: [FormsModule],
        providers: [NgForm],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyStringValuePartComponent);
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
          const newKey = '';
          const newValue = '';
          const newValueObject = {};
          set(newValueObject, '', '');
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
            expect(results.length == 2).toBeTrue();
            expect(results[0].nativeElement.value).toBe(newKey);
            expect(results[1].nativeElement.value).toBe(newValue);
            expect(subjectSpy).toHaveBeenCalledTimes(1);
            expect(subjectSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(propertyName, newValueObject));
          });
        }),
      );
    });
  });

  it(
    'should change key and publish change on user input',
    waitForAsync(() => {
      const oldItemKey = 'oldKey';
      const oldItemValue = 'oldValue';
      const newItemKey = 'newKey';

      const oldValueObject = {};
      set(oldValueObject, 'keyOne', 'valueOne');
      set(oldValueObject, oldItemKey, oldItemValue);
      set(oldValueObject, 'keyThree', 'valueThree');

      const newValueObject = {};
      set(newValueObject, 'keyOne', 'valueOne');
      set(newValueObject, newItemKey, oldItemValue);
      set(newValueObject, 'keyThree', 'valueThree');

      const propertyName = 'property';
      const partValidation = PartValidationFactory.create(true, 5, 50);
      const testedSubject = new Subject<WorkflowEntryModel>();
      const subjectSpy = spyOn(testedSubject, 'next');

      underTest.isShow = false;
      underTest.name = 'name';
      underTest.value = oldValueObject;
      underTest.property = propertyName;
      underTest.valueChanges = testedSubject;
      underTest.partValidation = partValidation;

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const inputElement = fixture.debugElement.queryAll(inputSelector)[2];

        inputElement.nativeElement.value = newItemKey;
        inputElement.nativeElement.dispatchEvent(new Event('input'));

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          const testedValue = fixture.debugElement.queryAll(inputSelector)[2].nativeElement.value;
          expect(testedValue).toBe(newItemKey);
          expect(subjectSpy).toHaveBeenCalled();
          expect(subjectSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(propertyName, newValueObject));
        });
      });
    }),
  );

  it(
    'should change value and publish change on user input',
    waitForAsync(() => {
      const oldItemKey = 'oldKey';
      const oldItemValue = 'oldValue';
      const newItemValue = 'newValue';

      const oldValueObject = {};
      set(oldValueObject, 'keyOne', 'valueOne');
      set(oldValueObject, oldItemKey, oldItemValue);
      set(oldValueObject, 'keyThree', 'valueThree');

      const newValueObject = {};
      set(newValueObject, 'keyOne', 'valueOne');
      set(newValueObject, oldItemKey, newItemValue);
      set(newValueObject, 'keyThree', 'valueThree');

      const propertyName = 'property';
      const partValidation = PartValidationFactory.create(true, 5, 50);
      const testedSubject = new Subject<WorkflowEntryModel>();
      const subjectSpy = spyOn(testedSubject, 'next');

      underTest.isShow = false;
      underTest.name = 'name';
      underTest.value = oldValueObject;
      underTest.property = propertyName;
      underTest.valueChanges = testedSubject;
      underTest.partValidation = partValidation;

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const inputElement = fixture.debugElement.queryAll(inputSelector)[3];

        inputElement.nativeElement.value = newItemValue;
        inputElement.nativeElement.dispatchEvent(new Event('input'));

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          const testedValue = fixture.debugElement.queryAll(inputSelector)[3].nativeElement.value;
          expect(testedValue).toBe(newItemValue);
          expect(subjectSpy).toHaveBeenCalled();
          expect(subjectSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(propertyName, newValueObject));
        });
      });
    }),
  );

  it(
    'onDelete() should remove element from value and publish change',
    waitForAsync(() => {
      const oldValueObject = {};
      set(oldValueObject, 'keyOne', 'valueOne');
      set(oldValueObject, 'keyTwo', 'valueTwo');
      set(oldValueObject, 'keyThree', 'valueThree');

      const newValueObject = {};
      set(newValueObject, 'keyOne', 'valueOne');
      set(newValueObject, 'keyThree', 'valueThree');

      const propertyName = 'property';
      const partValidation = PartValidationFactory.create(true, 5, 50);
      const testedSubject = new Subject<WorkflowEntryModel>();
      const subjectSpy = spyOn(testedSubject, 'next');

      underTest.isShow = false;
      underTest.name = 'name';
      underTest.value = oldValueObject;
      underTest.property = propertyName;
      underTest.valueChanges = testedSubject;
      underTest.partValidation = partValidation;

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        underTest.onDelete(1);

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(subjectSpy).toHaveBeenCalled();
          expect(subjectSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(propertyName, newValueObject));
        });
      });
    }),
  );

  it(
    'onAdd() should add empty string key value element to value and publish change',
    waitForAsync(() => {
      const oldValueObject = {};
      set(oldValueObject, 'keyOne', 'valueOne');
      set(oldValueObject, 'keyTwo', 'valueTwo');

      const newValueObject = {};
      set(newValueObject, 'keyOne', 'valueOne');
      set(newValueObject, 'keyTwo', 'valueTwo');
      set(newValueObject, '', '');

      const propertyName = 'property';
      const partValidation = PartValidationFactory.create(true, 5, 50);
      const testedSubject = new Subject<WorkflowEntryModel>();
      const subjectSpy = spyOn(testedSubject, 'next');

      underTest.isShow = false;
      underTest.name = 'name';
      underTest.value = oldValueObject;
      underTest.property = propertyName;
      underTest.valueChanges = testedSubject;
      underTest.partValidation = partValidation;

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        underTest.onAdd();

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(subjectSpy).toHaveBeenCalled();
          expect(subjectSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(propertyName, newValueObject));
        });
      });
    }),
  );
});
