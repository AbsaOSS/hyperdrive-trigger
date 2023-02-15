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

import { StringWithVerifyPartComponent } from './string-with-verify-part.component';
import { By } from '@angular/platform-browser';
import { DebugElement, Predicate } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { createSpyFromClass, Spy } from 'jasmine-auto-spies';
import { of } from 'rxjs';
import { VerifyPartModelFactory } from '../../../../../models/verifyPart.model';

describe('StringWithVerifyPartComponent', () => {
  let fixture: ComponentFixture<StringWithVerifyPartComponent>;
  let underTest: StringWithVerifyPartComponent;
  let toastrServiceSpy: Spy<ToastrService>;

  const inputSelector: Predicate<DebugElement> = By.css('input[type="text"]');

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [StringWithVerifyPartComponent],
        imports: [FormsModule],
        providers: [NgForm, { provide: ToastrService, useValue: createSpyFromClass(ToastrService) }],
      }).compileComponents();
      toastrServiceSpy = TestBed.inject<any>(ToastrService);
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(StringWithVerifyPartComponent);
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
        waitForAsync(() => {
          const oldValue = parameter;
          const newValue = '';
          spyOn(underTest.valueChange, 'emit');

          underTest.isShow = false;
          underTest.isRequired = true;
          underTest.name = 'name';
          underTest.value = oldValue;
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
    'should change value and emit change on user input',
    waitForAsync(() => {
      const oldValue = 'oldValue';
      const newValue = 'newValue';
      spyOn(underTest.valueChange, 'emit');

      underTest.isShow = false;
      underTest.name = 'name';
      underTest.value = oldValue;

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const inputElement = fixture.debugElement.query(inputSelector).nativeElement;

        inputElement.value = newValue;
        inputElement.dispatchEvent(new Event('input'));

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          const testedValue = fixture.debugElement.query(inputSelector).nativeElement.value;
          expect(testedValue).toBe(newValue);
          expect(underTest.valueChange.emit).toHaveBeenCalled();
          expect(underTest.valueChange.emit).toHaveBeenCalledWith(newValue);
        });
      });
    }),
  );

  it('verify() should set only verifyResponse when component is in show mode', () => {
    const verifyResponse = VerifyPartModelFactory.create(false, 'Random');
    underTest.isShow = true;
    underTest.verifyCall = function (topic: string) {
      return of(verifyResponse);
    };

    underTest.verify();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.verifyResponse).toBe(verifyResponse);
      expect(underTest.loadingVerify).toBe(false);
    });
  });

  it('verify() should show error toast when input is invalid and component is in edit mode', () => {
    const verifyResponse = VerifyPartModelFactory.create(false, 'Random');
    const toastrServiceSpyError = toastrServiceSpy.error;
    underTest.isShow = false;
    underTest.verifyCall = function (topic: string) {
      return of(verifyResponse);
    };

    underTest.verify();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.loadingVerify).toBe(false);
      expect(toastrServiceSpyError).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpyError).toHaveBeenCalledWith(verifyResponse.message);
    });
  });

  it('verify() should show error toast when input is valid and component is in edit mode', () => {
    const verifyResponse = VerifyPartModelFactory.create(true, 'Random');
    const toastrServiceSpyError = toastrServiceSpy.success;
    underTest.isShow = false;
    underTest.verifyCall = function (topic: string) {
      return of(verifyResponse);
    };

    underTest.verify();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.loadingVerify).toBe(false);
      expect(toastrServiceSpyError).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpyError).toHaveBeenCalledWith(verifyResponse.message);
    });
  });
});
