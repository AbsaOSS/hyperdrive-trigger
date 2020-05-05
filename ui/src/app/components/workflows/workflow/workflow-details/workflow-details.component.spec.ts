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

import { WorkflowDetailsComponent } from './workflow-details.component';
import { provideMockStore } from "@ngrx/store/testing";
import { WorkflowFormPartsModel } from "../../../../models/workflowFormParts.model";

describe('WorkflowDetailsComponent', () => {
  let fixture: ComponentFixture<WorkflowDetailsComponent>;
  let underTest: WorkflowDetailsComponent;

  const initialAppState = {
    workflows: {
      workflowFormParts: new WorkflowFormPartsModel(
        [],
        undefined,
        undefined,
        undefined,
        undefined
      ),
      workflowAction: {
        mode: 'mode',
        workflowData: {
          details: [
            { property: 'propertyOne', value: 'valueOne' },
            { property: 'propertyTwo', value: 'valueTwo' }
          ]
        }
      }
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState: initialAppState })
      ],
      declarations: [ WorkflowDetailsComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowDetailsComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it('should after view init set component properties', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.mode).toBe(initialAppState.workflows.workflowAction.mode);
      expect(underTest.data).toBe(initialAppState.workflows.workflowAction.workflowData.details);
      expect(underTest.parts).toBe(initialAppState.workflows.workflowFormParts.detailsParts);
    });
  }));

  it('getValue() should return value when property exists', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const queriedDetail = initialAppState.workflows.workflowAction.workflowData.details[0];
      expect(underTest.getValue(queriedDetail.property)).toBe(queriedDetail.value);
    });
  }));

  it('getValue() should return undefined when property doesnt exists', async(() => {
    const undefinedProperty = 'undefinedProperty';

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.getValue(undefinedProperty)).toBe(undefined);
    });
  }));

});
