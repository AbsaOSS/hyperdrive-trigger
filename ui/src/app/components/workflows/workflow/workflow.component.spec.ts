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

import { WorkflowComponent } from './workflow.component';
import { provideMockStore } from '@ngrx/store/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { PreviousRouteService } from '../../../services/previousRoute/previous-route.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog/confirmation-dialog.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../../stores/app.reducers';
import { StartWorkflowInitialization } from '../../../stores/workflows/workflows.actions';
import { DynamicFormPartsFactory, WorkflowFormPartsModelFactory } from '../../../models/workflowFormParts.model';
import { workflowFormParts, workflowFormPartsSequences } from '../../../constants/workflowFormParts.constants';

describe('WorkflowComponent', () => {
  let underTest: WorkflowComponent;
  let fixture: ComponentFixture<WorkflowComponent>;
  let previousRouteService: PreviousRouteService;
  let router: Router;
  let confirmationDialogService: ConfirmationDialogService;
  let store: Store<AppState>;

  const initialAppState = {
    workflows: {
      workflowAction: {
        loading: true,
        mode: 'mode',
        id: 0,
        workflow: {
          isActive: true,
        },
        workflowFormData: {
          details: [{ property: 'detailProp', value: 'detailVal' }],
          sensor: [{ property: 'sensorProp', value: 'sensorVal' }],
          jobs: [{ jobId: 'jobId', order: 0, entries: [{ property: 'jobProp', value: 'jobVal' }] }],
        },
        workflowFormParts: WorkflowFormPartsModelFactory.create(
          workflowFormPartsSequences.allDetails,
          workflowFormParts.SENSOR.SENSOR_TYPE,
          workflowFormParts.JOB.JOB_NAME,
          workflowFormParts.JOB.JOB_TEMPLATE_ID,
          DynamicFormPartsFactory.create([], []),
        ),
        backendValidationErrors: ['validationError'],
      },
    },
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [
          ConfirmationDialogService,
          provideMockStore({ initialState: initialAppState }),
          {
            provide: ActivatedRoute,
            useValue: {
              params: of({
                id: 0,
                mode: 'mode',
              }),
            },
          },
          PreviousRouteService,
        ],
        imports: [RouterTestingModule.withRoutes([])],
        declarations: [WorkflowComponent],
      }).compileComponents();
      previousRouteService = TestBed.inject(PreviousRouteService);
      router = TestBed.inject(Router);
      confirmationDialogService = TestBed.inject(ConfirmationDialogService);
      store = TestBed.inject(Store);
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it(
    'should set properties during on init',
    waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(underTest.loading).toBe(initialAppState.workflows.workflowAction.loading);
        expect(underTest.mode).toBe(initialAppState.workflows.workflowAction.mode);
        expect(underTest.id).toBe(initialAppState.workflows.workflowAction.id);
        expect(underTest.isWorkflowActive).toBe(initialAppState.workflows.workflowAction.workflow.isActive);
        expect(underTest.backendValidationErrors).toBe(initialAppState.workflows.workflowAction.backendValidationErrors);
        expect(underTest.workflowFormParts).toBe(initialAppState.workflows.workflowAction.workflowFormParts);
        expect(underTest.workflowData).toBe(initialAppState.workflows.workflowAction.workflowFormData);
      });
    }),
  );

  it(
    'when changes is dispatched from child component it should propagate action to store',
    waitForAsync(() => {
      const usedAction = new StartWorkflowInitialization({ id: 1, mode: 'mode' });
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const storeSpy = spyOn(store, 'dispatch');
        underTest.changes.next(usedAction);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(storeSpy).toHaveBeenCalledTimes(1);
          expect(storeSpy).toHaveBeenCalledWith(usedAction);
        });
      });
    }),
  );
});
