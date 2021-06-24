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

import { DurationPartComponent } from './duration-part.component';
import { Subject } from 'rxjs';
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../../../../models/workflowEntry.model';
import { By } from '@angular/platform-browser';
import { DebugElement, Predicate } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { PartValidationFactory } from '../../../../../models/workflowFormParts.model';

describe('DurationPartComponent', () => {
  let fixture: ComponentFixture<DurationPartComponent>;
  let underTest: DurationPartComponent;

  const inputSelector: Predicate<DebugElement> = By.css('input[type="number"]');

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DurationPartComponent],
        imports: [FormsModule],
        providers: [NgForm],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(DurationPartComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  describe('should set value 0 on init when value is undefined or null', () => {
    const parameters = [null, undefined];

    parameters.forEach((parameter) => {
      it(
        'should pass with ' + parameter + ' value',
        waitForAsync(() => {
          const oldValue = parameter;
          const newValue = 0;
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
            const results = fixture.debugElement.queryAll(inputSelector).map((element) => element.nativeElement.value);
            expect(results).toEqual(['0', '0', '0', '0']);
            expect(subjectSpy).toHaveBeenCalledTimes(1);
            expect(subjectSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(propertyName, newValue));
          });
        }),
      );
    });
  });

  it(
    'should initialize, days, hours, minutes and seconds from initial value',
    waitForAsync(() => {
      const initialValue = 100001;
      const propertyName = 'property';
      const testedSubject = new Subject<WorkflowEntryModel>();
      const partValidation = PartValidationFactory.create(true, 5, 50);

      underTest.isShow = false;
      underTest.name = 'name';
      underTest.value = initialValue;
      underTest.property = propertyName;
      underTest.valueChanges = testedSubject;
      underTest.partValidation = partValidation;

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        const results = fixture.debugElement.queryAll(inputSelector).map((element) => element.nativeElement.value);
        expect(results).toEqual(['1', '3', '46', '41']);
      });
    }),
  );

  it(
    'should change value and publish change on user input',
    waitForAsync(() => {
      const oldValue = 30;
      const newValue = 52;
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
        const inputElement = fixture.debugElement.queryAll(inputSelector)[3].nativeElement;

        inputElement.value = newValue;
        inputElement.dispatchEvent(new Event('input'));

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          const testedValue = fixture.debugElement.queryAll(inputSelector)[3].nativeElement.value;
          expect(testedValue).toBe(newValue.toString());
          expect(subjectSpy).toHaveBeenCalled();
          expect(subjectSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(propertyName, newValue));
        });
      });
    }),
  );

  describe('convertFromTotalSeconds should convert total seconds to days, hours, minutes and seconds', () => {
    const parameters = [
      { input: 42, output: { d: 0, h: 0, m: 0, s: 42 } },
      { input: 600, output: { d: 0, h: 0, m: 10, s: 0 } },
      { input: 3654, output: { d: 0, h: 1, m: 0, s: 54 } },
      { input: 12037, output: { d: 0, h: 3, m: 20, s: 37 } },
      { input: 100001, output: { d: 1, h: 3, m: 46, s: 41 } },
      { input: null, output: { d: 0, h: 0, m: 0, s: 0 } },
      { input: undefined, output: { d: 0, h: 0, m: 0, s: 0 } },
    ];

    parameters.forEach((parameter) => {
      it('should pass for value ' + parameter.input, () => {
        underTest.convertFromTotalSeconds(parameter.input);
        expect(underTest.days).toBe(parameter.output.d);
        expect(underTest.hours).toBe(parameter.output.h);
        expect(underTest.minutes).toBe(parameter.output.m);
        expect(underTest.seconds).toBe(parameter.output.s);
      });
    });
  });

  describe('convertToTotalSeconds should convert days, hours, minutes and seconds to total seconds', () => {
    const parameters = [
      { output: 42, input: { d: 0, h: 0, m: 0, s: 42 } },
      { output: 600, input: { d: 0, h: 0, m: 10, s: 0 } },
      { output: 3654, input: { d: 0, h: 1, m: 0, s: 54 } },
      { output: 12037, input: { d: 0, h: 3, m: 20, s: 37 } },
      { output: 100001, input: { d: 1, h: 3, m: 46, s: 41 } },
      { output: 0, input: { d: undefined, h: undefined, m: undefined, s: undefined } },
      { output: 0, input: { d: null, h: null, m: null, s: null } },
    ];

    parameters.forEach((parameter) => {
      it('should pass for value ' + parameter.input, () => {
        underTest.days = parameter.input.d;
        underTest.hours = parameter.input.h;
        underTest.minutes = parameter.input.m;
        underTest.seconds = parameter.input.s;
        const result = underTest.convertToTotalSeconds();
        expect(result).toBe(parameter.output);
      });
    });
  });
});
