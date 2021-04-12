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

import { BooleanPartComponent } from './boolean-part.component';
import { DebugElement, Predicate } from '@angular/core';
import { Subject } from 'rxjs';
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../../../../models/workflowEntry.model';
import { By } from '@angular/platform-browser';
import { FormsModule, NgForm } from '@angular/forms';

describe('BooleanPartComponent', () => {
  let fixture: ComponentFixture<BooleanPartComponent>;
  let underTest: BooleanPartComponent;

  const inputSelector: Predicate<DebugElement> = By.css('input[type="checkbox"]');

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [BooleanPartComponent],
        imports: [FormsModule],
        providers: [NgForm],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(BooleanPartComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  describe('should set false on init when value is undefined or null', () => {
    const parameters = [null, undefined];

    parameters.forEach((parameter) => {
      it(
        'should pass with ' + parameter + ' value',
        waitForAsync(() => {
          const oldValue = parameter;
          const newValue = false;
          const propertyName = 'property';
          const testedSubject = new Subject<WorkflowEntryModel>();
          const subjectSpy = spyOn(testedSubject, 'next');

          underTest.isShow = false;
          underTest.name = 'name';
          underTest.value = oldValue;
          underTest.property = propertyName;
          underTest.valueChanges = testedSubject;
          fixture.detectChanges();

          fixture.whenStable().then(() => {
            const result = fixture.debugElement.query(inputSelector).nativeElement.checked;
            expect(result).toBe(newValue);
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
      const oldValue = false;
      const newValue = true;
      const propertyName = 'property';
      const testedSubject = new Subject<WorkflowEntryModel>();
      const subjectSpy = spyOn(testedSubject, 'next');

      underTest.isShow = false;
      underTest.name = 'name';
      underTest.value = oldValue;
      underTest.property = propertyName;
      underTest.valueChanges = testedSubject;

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const inputElement = fixture.debugElement.query(inputSelector).nativeElement;

        inputElement.click();

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          const testedValue = fixture.debugElement.query(inputSelector).nativeElement.checked;
          expect(testedValue).toBe(newValue);
          expect(subjectSpy).toHaveBeenCalled();
          expect(subjectSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(propertyName, newValue));
        });
      });
    }),
  );
});
