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
import { BooleanFilterComponent } from './boolean-filter.component';
import { WorkflowModelFactory } from '../../../../../models/workflow.model';

describe('BooleanFilterComponent', () => {
  let fixture: ComponentFixture<BooleanFilterComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [],
        declarations: [BooleanFilterComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(BooleanFilterComponent);
  });

  it('should create', () => {
    const underTest = fixture.componentInstance;
    expect(underTest).toBeTruthy();
  });

  describe('accepts', () => {
    it('should accept on true isTrue value and true testedValue', () => {
      const underTest = fixture.componentInstance;
      underTest.value = { isTrue: true, isFalse: undefined };
      underTest.property = 'isActive';
      const workflow = WorkflowModelFactory.create('workflowName', true, 'projectName', new Date(Date.now()), new Date(Date.now()), 0);

      expect(underTest.accepts(workflow)).toBeTrue();
    });

    it('should not accept on true isTrue value and false testedValue', () => {
      const underTest = fixture.componentInstance;
      underTest.value = { isTrue: true, isFalse: false };
      underTest.property = 'isActive';
      const workflow = WorkflowModelFactory.create('workflowName', false, 'projectName', new Date(Date.now()), new Date(Date.now()), 0);

      expect(underTest.accepts(workflow)).toBeFalse();
    });

    it('should not accept on false isTrue value and true testedValue', () => {
      const underTest = fixture.componentInstance;
      underTest.value = { isTrue: false, isFalse: false };
      underTest.property = 'isActive';
      const workflow = WorkflowModelFactory.create('workflowName', true, 'projectName', new Date(Date.now()), new Date(Date.now()), 0);

      expect(underTest.accepts(workflow)).toBeFalse();
    });

    it('should accept on true isFalse value and false testedValue', () => {
      const underTest = fixture.componentInstance;
      underTest.value = { isTrue: undefined, isFalse: true };
      underTest.property = 'isActive';
      const workflow = WorkflowModelFactory.create('workflowName', false, 'projectName', new Date(Date.now()), new Date(Date.now()), 0);

      expect(underTest.accepts(workflow)).toBeTrue();
    });

    it('should not accept on true isFalse value and true testedValue', () => {
      const underTest = fixture.componentInstance;
      underTest.value = { isTrue: undefined, isFalse: true };
      underTest.property = 'isActive';
      const workflow = WorkflowModelFactory.create('workflowName', true, 'projectName', new Date(Date.now()), new Date(Date.now()), 0);

      expect(underTest.accepts(workflow)).toBeFalse();
    });

    it('should not accept on false isFalse value and false testedValue', () => {
      const underTest = fixture.componentInstance;
      underTest.value = { isTrue: undefined, isFalse: false };
      underTest.property = 'isActive';
      const workflow = WorkflowModelFactory.create('workflowName', false, 'projectName', new Date(Date.now()), new Date(Date.now()), 0);

      expect(underTest.accepts(workflow)).toBeFalse();
    });
  });
});
