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

import { DynamicPartsComponent } from './dynamic-parts.component';
import { Subject } from 'rxjs';
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../../../models/workflowEntry.model';

describe('DynamicPartsComponent', () => {
  let fixture: ComponentFixture<DynamicPartsComponent>;
  let underTest: DynamicPartsComponent;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DynamicPartsComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicPartsComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it(
    'getValue() should return value when property exists',
    waitForAsync(() => {
      const workflowEntryOne = WorkflowEntryModelFactory.create('propertyOne', 'valueOne');
      const workflowEntryTwo = WorkflowEntryModelFactory.create('propertyTwo', 'valueTwo');
      const testedSubject = new Subject<WorkflowEntryModel>();

      underTest.isShow = false;
      underTest.formParts = [];
      underTest.values = [workflowEntryOne, workflowEntryTwo];
      underTest.valueChanges = testedSubject;

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        const result = underTest.getValue(workflowEntryOne.property);
        expect(result).toBe(workflowEntryOne.value);
      });
    }),
  );

  it(
    'getValue() should return undefined when property does not exist',
    waitForAsync(() => {
      const workflowEntryOne = WorkflowEntryModelFactory.create('propertyOne', 'valueOne');
      const workflowEntryTwo = WorkflowEntryModelFactory.create('propertyTwo', 'valueTwo');
      const undefinedProperty = 'undefinedProperty';
      const testedSubject = new Subject<WorkflowEntryModel>();

      underTest.isShow = false;
      underTest.formParts = [];
      underTest.values = [workflowEntryOne, workflowEntryTwo];
      underTest.valueChanges = testedSubject;

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        const result = underTest.getValue(undefinedProperty);
        expect(result).toBe(undefined);
      });
    }),
  );
});
