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
          spyOn(underTest.valueChange, 'emit');

          underTest.isShow = false;
          underTest.isRequired = true;
          underTest.name = 'name';
          underTest.value = oldValue;
          fixture.detectChanges();

          fixture.whenStable().then(() => {
            expect(underTest.valueChange.emit).toHaveBeenCalled();
            expect(underTest.valueChange.emit).toHaveBeenCalledWith(newValue);
          });
        }),
      );
    });
  });

  it(
    'should change value and emit change on user input',
    waitForAsync(() => {
      const oldItem = 'two';
      const newItem = 'changed';
      const oldValue = ['one', oldItem, 'three'];
      const newValue = ['one', newItem, 'three'];
      spyOn(underTest.valueChange, 'emit');

      underTest.isShow = false;
      underTest.name = 'name';
      underTest.value = oldValue;

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const inputElement = fixture.debugElement.queryAll(inputSelector)[1];

        inputElement.nativeElement.value = newItem;
        inputElement.nativeElement.dispatchEvent(new Event('input'));

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          const testedValue = fixture.debugElement.queryAll(inputSelector)[1].nativeElement.value;
          expect(testedValue).toBe(newItem);
          expect(underTest.valueChange.emit).toHaveBeenCalled();
          expect(underTest.valueChange.emit).toHaveBeenCalledWith(newValue);
        });
      });
    }),
  );

  it(
    'onDeleteValue() should remove element from value and emit change',
    waitForAsync(() => {
      const oldValue = ['one', 'two', 'three'];
      const newValue = ['one', 'three'];
      spyOn(underTest.valueChange, 'emit');

      underTest.isShow = false;
      underTest.name = 'name';
      underTest.value = oldValue;

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        underTest.onDeleteValue(1);

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(underTest.valueChange.emit).toHaveBeenCalled();
          expect(underTest.valueChange.emit).toHaveBeenCalledWith(newValue);
        });
      });
    }),
  );

  it(
    'onAddValue() should add empty string to value and emit change',
    waitForAsync(() => {
      const oldValue = ['one', 'two'];
      const newValue = ['one', 'two', ''];
      spyOn(underTest.valueChange, 'emit');

      underTest.isShow = false;
      underTest.name = 'name';
      underTest.value = oldValue;

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        underTest.onAddValue();

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(underTest.valueChange.emit).toHaveBeenCalled();
          expect(underTest.valueChange.emit).toHaveBeenCalledWith(newValue);
        });
      });
    }),
  );

  it(
    'setDefaultValue() should set array with empty string when value is undefined and field is required',
    waitForAsync(() => {
      const value = undefined;
      spyOn(underTest.valueChange, 'emit');

      underTest.isShow = false;
      underTest.isRequired = true;
      underTest.value = value;

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        underTest.setDefaultValue();

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          const expectedValue = [''];
          expect(underTest.valueChange.emit).toHaveBeenCalled();
          expect(underTest.valueChange.emit).toHaveBeenCalledWith(expectedValue);
        });
      });
    }),
  );

  it(
    'setDefaultValue() should set empty array when value is undefined and field is not required',
    waitForAsync(() => {
      const value = undefined;
      spyOn(underTest.valueChange, 'emit');

      underTest.isShow = false;
      underTest.isRequired = false;
      underTest.value = value;

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        underTest.setDefaultValue();

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          const expectedValue = [];
          expect(underTest.valueChange.emit).toHaveBeenCalled();
          expect(underTest.valueChange.emit).toHaveBeenCalledWith(expectedValue);
        });
      });
    }),
  );

  it(
    'setDefaultValue() should do nothing when value is not undefined',
    waitForAsync(() => {
      const value = [''];
      spyOn(underTest.valueChange, 'emit');

      underTest.isShow = false;
      underTest.value = value;

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        underTest.setDefaultValue();

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(underTest.valueChange.emit).toHaveBeenCalledTimes(0);
        });
      });
    }),
  );

  it(
    'getFreeTextInputValue() should return concatenated string',
    waitForAsync(() => {
      const emptyArray = [];
      const arrayWithOnlyEmptyElements = ['', ''];
      const arrayWithEmptyElements = ['', 'a', '', 'b', ''];
      const arrayWithoutEmptyElements = ['a', 'b', 'c', 'd'];

      underTest.value = emptyArray;
      expect(underTest.getFreeTextInputValue()).toEqual('');

      underTest.value = arrayWithOnlyEmptyElements;
      expect(underTest.getFreeTextInputValue()).toEqual('\n');

      underTest.value = arrayWithEmptyElements;
      expect(underTest.getFreeTextInputValue()).toEqual('\na\n\nb\n');

      underTest.value = arrayWithoutEmptyElements;
      expect(underTest.getFreeTextInputValue()).toEqual('a\nb\nc\nd');
    }),
  );

  it(
    'freeTextInputChange() should change value and emit change on user input - empty array',
    waitForAsync(() => {
      const newValue = '';
      const expectedNewValue = [];
      spyOn(underTest.valueChange, 'emit');

      underTest.isShow = false;

      underTest.freeTextInputChange(newValue);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(underTest.valueChange.emit).toHaveBeenCalled();
        expect(underTest.valueChange.emit).toHaveBeenCalledWith(expectedNewValue);
      });
    }),
  );

  it(
    'freeTextInputChange() should change value and emit change on user input - array with only empty elements',
    waitForAsync(() => {
      const newValue = '\n';
      const expectedNewValue = ['', ''];
      spyOn(underTest.valueChange, 'emit');

      underTest.isShow = false;

      underTest.freeTextInputChange(newValue);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(underTest.valueChange.emit).toHaveBeenCalled();
        expect(underTest.valueChange.emit).toHaveBeenCalledWith(expectedNewValue);
      });
    }),
  );

  it(
    'freeTextInputChange() should change value and emit change on user input - array with empty elements',
    waitForAsync(() => {
      const newValue = '\na\n\nb\n';
      const expectedNewValue = ['', 'a', '', 'b', ''];
      spyOn(underTest.valueChange, 'emit');

      underTest.isShow = false;

      underTest.freeTextInputChange(newValue);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(underTest.valueChange.emit).toHaveBeenCalled();
        expect(underTest.valueChange.emit).toHaveBeenCalledWith(expectedNewValue);
      });
    }),
  );

  it(
    'freeTextInputChange() should change value and emit change on user input - array without empty elements',
    waitForAsync(() => {
      const newValue = 'a\nb\nc\nd';
      const expectedNewValue = ['a', 'b', 'c', 'd'];
      spyOn(underTest.valueChange, 'emit');

      underTest.isShow = false;

      underTest.freeTextInputChange(newValue);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(underTest.valueChange.emit).toHaveBeenCalled();
        expect(underTest.valueChange.emit).toHaveBeenCalledWith(expectedNewValue);
      });
    }),
  );
});
