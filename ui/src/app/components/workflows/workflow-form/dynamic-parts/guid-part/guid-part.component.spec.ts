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
import { Subject } from 'rxjs';
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../../../../models/workflowEntry.model';
import { PartValidationFactory } from '../../../../../models/workflowFormParts.model';

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
            const result = underTest.value;
            expect(result.length).toBe(36);
            expect(subjectSpy).toHaveBeenCalledTimes(1);
            expect(subjectSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(propertyName, result));
          });
        }),
      );
    });
  });

  it(
    'should change value and publish change on user input',
    waitForAsync(() => {
      const propertyName = 'property';
      const testedSubject = new Subject<WorkflowEntryModel>();
      const subjectSpy = spyOn(testedSubject, 'next');
      const partValidation = PartValidationFactory.create(true, 5, 50);

      underTest.isShow = false;
      underTest.name = 'name';
      underTest.value = null;
      underTest.property = propertyName;
      underTest.valueChanges = testedSubject;
      underTest.partValidation = partValidation;

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const oldValue = underTest.value;

        expect(oldValue.length).toBe(36);
        expect(subjectSpy).toHaveBeenCalled();
        expect(subjectSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(propertyName, oldValue));

        const buttonElement = fixture.debugElement.query(buttonSelector).nativeElement;
        buttonElement.click();

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          const testedValue = underTest.value;
          expect(testedValue.length).toBe(36);
          expect(oldValue != testedValue).toBeTrue();
          expect(subjectSpy).toHaveBeenCalled();
          expect(subjectSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(propertyName, testedValue));
        });
      });
    }),
  );
});
