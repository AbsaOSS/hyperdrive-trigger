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

import { GuidPartComponent } from './guid-part.component';
import { DebugElement, Predicate } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule, NgForm } from '@angular/forms';

describe('GuidPartComponent', () => {
  let fixture: ComponentFixture<GuidPartComponent>;
  let underTest: GuidPartComponent;

  const buttonSelector: Predicate<DebugElement> = By.css('button[type="button"]');

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [GuidPartComponent],
        imports: [FormsModule],
        providers: [NgForm],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(GuidPartComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  describe('should set new guid on init when value is undefined or null', () => {
    const parameters = [null, undefined];

    parameters.forEach((parameter) => {
      it(
        'should pass with ' + parameter + ' value',
        waitForAsync(() => {
          const oldValue = parameter;
          spyOn(underTest.valueChange, 'emit');

          underTest.isShow = false;
          underTest.name = 'name';
          underTest.value = oldValue;
          fixture.detectChanges();

          fixture.whenStable().then(() => {
            const result = underTest.value;
            expect(result.length).toBe(36);
            expect(underTest.valueChange.emit).toHaveBeenCalled();
            expect(underTest.valueChange.emit).toHaveBeenCalledWith(result);
          });
        }),
      );
    });
  });

  it(
    'should change value and publish change on user input',
    waitForAsync(() => {
      spyOn(underTest.valueChange, 'emit');

      underTest.isShow = false;
      underTest.name = 'name';
      underTest.value = null;

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const oldValue = underTest.value;

        expect(oldValue.length).toBe(36);
        expect(underTest.valueChange.emit).toHaveBeenCalled();
        expect(underTest.valueChange.emit).toHaveBeenCalledWith(oldValue);

        const buttonElement = fixture.debugElement.query(buttonSelector).nativeElement;
        buttonElement.click();

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          const testedValue = underTest.value;
          expect(testedValue.length).toBe(36);
          expect(oldValue != testedValue).toBeTrue();
          expect(underTest.valueChange.emit).toHaveBeenCalled();
          expect(underTest.valueChange.emit).toHaveBeenCalledWith(testedValue);
        });
      });
    }),
  );
});
