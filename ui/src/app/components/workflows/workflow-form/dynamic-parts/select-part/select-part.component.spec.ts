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

import { SelectPartComponent } from './select-part.component';
import { DebugElement, Predicate } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule, NgForm } from '@angular/forms';

describe('SelectPartComponent', () => {
  let fixture: ComponentFixture<SelectPartComponent>;
  let underTest: SelectPartComponent;

  const inputSelector: Predicate<DebugElement> = By.css('select');

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SelectPartComponent],
        imports: [FormsModule],
        providers: [NgForm],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectPartComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  describe('should set first value from options on init when value is undefined or null', () => {
    const parameters = [null, undefined];

    parameters.forEach((parameter) => {
      it(
        'should pass with ' + parameter + ' value',
        waitForAsync(() => {
          const oldValue = parameter;
          const newValue = 'oneValue';
          const options = new Map([
            [newValue, 'oneLabel'],
            ['two', 'twoLabel'],
            ['three', 'threeLabel'],
          ]);
          spyOn(underTest.valueChange, 'emit');

          underTest.isShow = false;
          underTest.isRequired = true;
          underTest.name = 'name';
          underTest.value = oldValue;
          underTest.options = options;
          underTest.ngOnInit();
          fixture.detectChanges();

          fixture.whenStable().then(() => {
            const result = fixture.debugElement.query(inputSelector).nativeElement.value;
            expect(result).toBe(newValue);
            expect(underTest.valueChange.emit).toHaveBeenCalled();
            expect(underTest.valueChange.emit).toHaveBeenCalledWith(newValue);
          });
        }),
      );
    });
  });

  it(
    'should change value and publish change on user input',
    waitForAsync(() => {
      const oldValue = 'oneValue';
      const newValue = 'threeValue';
      const options = new Map([
        [oldValue, 'oneLabel'],
        ['two', 'two'],
        [newValue, 'threeLabel'],
      ]);

      spyOn(underTest.valueChange, 'emit');

      underTest.isShow = false;
      underTest.name = 'name';
      underTest.value = oldValue;
      underTest.options = options;

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const inputElement = fixture.debugElement.query(inputSelector).nativeElement;
        inputElement.value = newValue;
        inputElement.dispatchEvent(new Event('change'));

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          const testedValue = fixture.debugElement.query(inputSelector).nativeElement.value;
          expect(testedValue).toBe(newValue);
          expect(underTest.valueChange.emit).toHaveBeenCalled();
          expect(underTest.valueChange.emit).toHaveBeenCalledWith(testedValue);
        });
      });
    }),
  );
});
