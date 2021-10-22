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
import { ActivatedRoute, Params } from '@angular/router';
import { Subject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { PreviousRouteService } from '../../../services/previousRoute/previous-route.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog/confirmation-dialog.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../../stores/app.reducers';
import { StartWorkflowInitialization } from '../../../stores/workflows/workflows.actions';
import { WorkflowJoinedModelFactory } from '../../../models/workflowJoined.model';

describe('WorkflowComponent', () => {
  let underTest: WorkflowComponent;
  let fixture: ComponentFixture<WorkflowComponent>;
  let store: Store<AppState>;
  const routeParams: Subject<Params> = new Subject<Params>();

  const initialAppState = {
    workflows: {
      projects: [],
      workflowAction: {
        loading: true,
        mode: 'mode',
        id: 0,
        workflow: WorkflowJoinedModelFactory.createEmpty(),
        workflowForForm: WorkflowJoinedModelFactory.createEmpty(),
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
              params: routeParams,
            },
          },
          PreviousRouteService,
        ],
        imports: [RouterTestingModule.withRoutes([])],
        declarations: [WorkflowComponent],
      }).compileComponents();
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
        expect(underTest.id).toBe(initialAppState.workflows.workflowAction.id);
        expect(underTest.mode).toBe(initialAppState.workflows.workflowAction.mode);
        expect(underTest.loading).toBe(initialAppState.workflows.workflowAction.loading);
        expect(underTest.initialWorkflow).toBe(initialAppState.workflows.workflowAction.workflow);
        expect(underTest.workflowForForm).toBe(initialAppState.workflows.workflowAction.workflowForForm);
        expect(underTest.backendValidationErrors).toEqual(initialAppState.workflows.workflowAction.backendValidationErrors);
      });
    }),
  );

  it(
    'when route is changed it should dispatch start workflow initialization',
    waitForAsync(() => {
      const newRouteParams = { id: 1, mode: 'mode' };
      const usedAction = new StartWorkflowInitialization(newRouteParams);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const storeSpy = spyOn(store, 'dispatch');
        routeParams.next(newRouteParams);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(storeSpy).toHaveBeenCalledTimes(1);
          expect(storeSpy).toHaveBeenCalledWith(usedAction);
        });
      });
    }),
  );
});
