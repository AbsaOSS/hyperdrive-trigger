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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BooleanFilterComponent } from './boolean-filter.component';
import { WorkflowModelFactory } from '../../../../../models/workflow.model';

describe('BooleanFilterComponent', () => {
  let fixture: ComponentFixture<BooleanFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [],
      declarations: [BooleanFilterComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BooleanFilterComponent);
  });

  it('should create', () => {
    const underTest = fixture.componentInstance;
    expect(underTest).toBeTruthy();
  });

  describe('accepts', () => {
    it('should accept on exact true match', () => {
      const underTest = fixture.componentInstance;
      underTest.value = true;
      underTest.property = 'isActive';
      const workflow = WorkflowModelFactory.create('workflowName', true, 'projectName', new Date(Date.now()), new Date(Date.now()), 0);

      expect(underTest.accepts(workflow)).toBeTrue();
    });

    it('should accept on exact false match', () => {
      const underTest = fixture.componentInstance;
      underTest.value = false;
      underTest.property = 'isActive';
      const workflow = WorkflowModelFactory.create('workflowName', false, 'projectName', new Date(Date.now()), new Date(Date.now()), 0);

      expect(underTest.accepts(workflow)).toBeTrue();
    });

    it('should accept on empty filter value', () => {
      const underTest = fixture.componentInstance;
      underTest.value = undefined;
      const workflow = WorkflowModelFactory.create('workflowName', false, 'projectName', new Date(Date.now()), new Date(Date.now()), 0);

      expect(underTest.accepts(workflow)).toBeTrue();
    });
  });

  describe('convertToBoolean', () => {
    it('should return fasle boolean on string false match', () => {
      const underTest = fixture.componentInstance;
      const booleanString = 'true';

      expect(underTest.convertToBoolean(booleanString)).toBeTrue();
    });

    it('should return true boolean on string true match', () => {
      const underTest = fixture.componentInstance;
      const booleanString = 'false';

      expect(underTest.convertToBoolean(booleanString)).toBeFalse();
    });

    it('should return undefined on none boolean string', () => {
      const underTest = fixture.componentInstance;
      const booleanString = 'fal';

      expect(underTest.convertToBoolean(booleanString)).toBeUndefined();
    });
  });
});
