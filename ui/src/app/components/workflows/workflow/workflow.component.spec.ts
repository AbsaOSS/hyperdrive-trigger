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

import { WorkflowComponent } from './workflow.component';
import { provideMockStore } from '@ngrx/store/testing';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog/confirmation-dialog.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../../stores/app.reducers';
import { DeleteWorkflow } from '../../../stores/workflows/workflows.actions';

describe('WorkflowComponent', () => {
  let underTest: WorkflowComponent;
  let fixture: ComponentFixture<WorkflowComponent>;
  let confirmationDialogService: ConfirmationDialogService;
  let store: Store<AppState>;

  const initialAppState = {
    workflows: {
      workflowAction: {
        loading: true,
        mode: 'mode',
        id: 0,
      },
    },
  };

  beforeEach(async(() => {
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
      ],
      declarations: [WorkflowComponent],
    }).compileComponents();
    confirmationDialogService = TestBed.inject(ConfirmationDialogService);
    store = TestBed.inject(Store);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it('should set properties during on init', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.loading).toBe(initialAppState.workflows.workflowAction.loading);
      expect(underTest.mode).toBe(initialAppState.workflows.workflowAction.mode);
      expect(underTest.id).toBe(initialAppState.workflows.workflowAction.id);
    });
  }));

  it('toggleDetailsAccordion() should toggle detail accordion', () => {
    expect(underTest.isDetailsAccordionHidden).toBeFalse();
    underTest.toggleDetailsAccordion();
    expect(underTest.isDetailsAccordionHidden).toBeTrue();
  });

  it('toggleSensorAccordion() should toggle sensor accordion', () => {
    expect(underTest.isSensorAccordionHidden).toBeFalse();
    underTest.toggleSensorAccordion();
    expect(underTest.isSensorAccordionHidden).toBeTrue();
  });

  it('toggleJobsAccordion() should toggle jobs accordion', () => {
    expect(underTest.isJobsAccordionHidden).toBeFalse();
    underTest.toggleJobsAccordion();
    expect(underTest.isJobsAccordionHidden).toBeTrue();
  });

  it('deleteWorkflow() should dispatch delete workflow action with id when dialog is confirmed', async(() => {
    const id = 1;
    const subject = new Subject<boolean>();
    const storeSpy = spyOn(store, 'dispatch');

    spyOn(confirmationDialogService, 'confirm').and.returnValue(subject.asObservable());

    underTest.deleteWorkflow(id);
    subject.next(true);

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(storeSpy).toHaveBeenCalled();
      expect(storeSpy).toHaveBeenCalledWith(new DeleteWorkflow(id));
    });
  }));

  it('deleteWorkflow() should not dispatch delete workflow action when dialog is not confirmed', async(() => {
    const id = 1;
    const subject = new Subject<boolean>();
    const storeSpy = spyOn(store, 'dispatch');

    spyOn(confirmationDialogService, 'confirm').and.returnValue(subject.asObservable());

    underTest.deleteWorkflow(id);
    subject.next(false);

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(storeSpy).toHaveBeenCalledTimes(0);
    });
  }));
});
