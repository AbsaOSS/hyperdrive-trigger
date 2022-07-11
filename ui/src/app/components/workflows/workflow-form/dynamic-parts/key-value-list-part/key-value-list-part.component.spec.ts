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

import { KeyValueListPartComponent } from './key-value-list-part.component';
import { DebugElement, Predicate } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule, NgForm } from '@angular/forms';
import { KeyValueModelFactory } from '../../../../../models/keyValue.model';

describe('KeyValueMapPartComponent', () => {
  let fixture: ComponentFixture<KeyValueListPartComponent>;
  let underTest: KeyValueListPartComponent;

  const inputSelector: Predicate<DebugElement> = By.css('input[type="text"]');

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [KeyValueListPartComponent],
        imports: [FormsModule],
        providers: [NgForm],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyValueListPartComponent);
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
          const newValueObject = [KeyValueModelFactory.create(newKey, newValue)];

          spyOn(underTest.valueChange, 'emit');

          underTest.isShow = false;
          underTest.isRequired = true;
          underTest.name = 'name';
          underTest.value = oldValue;
          fixture.detectChanges();

          fixture.whenStable().then(() => {
            const results = fixture.debugElement.queryAll(inputSelector);

            expect(results.length == 2).toBeTrue();
            expect(results[0].nativeElement.value).toBe(newKey);
            expect(results[1].nativeElement.value).toBe(newValue);
            expect(underTest.valueChange.emit).toHaveBeenCalled();
            expect(underTest.valueChange.emit).toHaveBeenCalledWith(newValueObject);
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

      const oldValueObject = [
        KeyValueModelFactory.create('keyOne', 'valueOne'),
        KeyValueModelFactory.create(oldItemKey, oldItemValue),
        KeyValueModelFactory.create('keyThree', 'valueThree'),
      ];

      const newValueObject = [
        KeyValueModelFactory.create('keyOne', 'valueOne'),
        KeyValueModelFactory.create(newItemKey, oldItemValue),
        KeyValueModelFactory.create('keyThree', 'valueThree'),
      ];

      spyOn(underTest.valueChange, 'emit');

      underTest.isShow = false;
      underTest.isRequired = true;
      underTest.name = 'name';
      underTest.value = oldValueObject;

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const inputElement = fixture.debugElement.queryAll(inputSelector)[2];

        inputElement.nativeElement.value = newItemKey;
        inputElement.nativeElement.dispatchEvent(new Event('input'));

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          const testedValue = fixture.debugElement.queryAll(inputSelector)[2].nativeElement.value;
          expect(testedValue).toBe(newItemKey);
          expect(underTest.valueChange.emit).toHaveBeenCalled();
          expect(underTest.valueChange.emit).toHaveBeenCalledWith(newValueObject);
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

      const oldValueObject = [
        KeyValueModelFactory.create('keyOne', 'valueOne'),
        KeyValueModelFactory.create(oldItemKey, oldItemValue),
        KeyValueModelFactory.create('keyThree', 'valueThree'),
      ];

      const newValueObject = [
        KeyValueModelFactory.create('keyOne', 'valueOne'),
        KeyValueModelFactory.create(oldItemKey, newItemValue),
        KeyValueModelFactory.create('keyThree', 'valueThree'),
      ];

      spyOn(underTest.valueChange, 'emit');

      underTest.isShow = false;
      underTest.isRequired = true;
      underTest.name = 'name';
      underTest.value = oldValueObject;

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const inputElement = fixture.debugElement.queryAll(inputSelector)[3];

        inputElement.nativeElement.value = newItemValue;
        inputElement.nativeElement.dispatchEvent(new Event('input'));

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          const testedValue = fixture.debugElement.queryAll(inputSelector)[3].nativeElement.value;
          expect(testedValue).toBe(newItemValue);
          expect(underTest.valueChange.emit).toHaveBeenCalled();
          expect(underTest.valueChange.emit).toHaveBeenCalledWith(newValueObject);
        });
      });
    }),
  );

  it(
    'onDelete() should remove element from value and publish change',
    waitForAsync(() => {
      const oldValueObject = [
        KeyValueModelFactory.create('keyOne', 'valueOne'),
        KeyValueModelFactory.create('keyTwo', 'valueTwo'),
        KeyValueModelFactory.create('keyThree', 'valueThree'),
      ];

      const newValueObject = [KeyValueModelFactory.create('keyOne', 'valueOne'), KeyValueModelFactory.create('keyThree', 'valueThree')];

      spyOn(underTest.valueChange, 'emit');

      underTest.isShow = false;
      underTest.isRequired = true;
      underTest.name = 'name';
      underTest.value = oldValueObject;

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        underTest.onDelete(1);

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(underTest.valueChange.emit).toHaveBeenCalled();
          expect(underTest.valueChange.emit).toHaveBeenCalledWith(newValueObject);
        });
      });
    }),
  );

  it(
    'onAdd() should add empty string key value element to value and publish change',
    waitForAsync(() => {
      const oldValueObject = [KeyValueModelFactory.create('keyOne', 'valueOne'), KeyValueModelFactory.create('keyTwo', 'valueTwo')];

      const newValueObject = [
        KeyValueModelFactory.create('keyOne', 'valueOne'),
        KeyValueModelFactory.create('keyTwo', 'valueTwo'),
        KeyValueModelFactory.create('', ''),
      ];

      spyOn(underTest.valueChange, 'emit');

      underTest.isShow = false;
      underTest.isRequired = true;
      underTest.name = 'name';
      underTest.value = oldValueObject;

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        underTest.onAdd();

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(underTest.valueChange.emit).toHaveBeenCalled();
          expect(underTest.valueChange.emit).toHaveBeenCalledWith(newValueObject);
        });
      });
    }),
  );
});
