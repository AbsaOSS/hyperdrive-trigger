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

import { provideMockStore } from '@ngrx/store/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { PreviousRouteService } from '../../../services/previousRoute/previous-route.service';
import { absoluteRoutes } from '../../../constants/routes.constants';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog/confirmation-dialog.service';
import { Action, Store } from '@ngrx/store';
import { AppState } from '../../../stores/app.reducers';
import {
  CreateWorkflow,
  DeleteWorkflow,
  ExportWorkflows,
  LoadJobsForRun,
  RemoveBackendValidationError,
  SwitchWorkflowActiveState,
  UpdateWorkflow,
} from '../../../stores/workflows/workflows.actions';
import { WorkflowFormComponent } from './workflow-form.component';
import { JobEntryModelFactory } from '../../../models/jobEntry.model';
import { WorkflowFormPartsModelFactory } from '../../../models/workflowFormParts.model';
import { FormsModule } from '@angular/forms';
import { WorkflowEntryModelFactory } from '../../../models/workflowEntry.model';

describe('WorkflowFormComponent', () => {
  let underTest: WorkflowFormComponent;
  let fixture: ComponentFixture<WorkflowFormComponent>;
  let previousRouteService: PreviousRouteService;
  let router;
  let confirmationDialogService: ConfirmationDialogService;
  let store: Store<AppState>;

  const initialAppState = {
    workflows: {
      projects: [
        { name: 'projectA', workflows: [] },
        { name: 'projectB', workflows: [] },
      ],
      workflowAction: {
        loading: true,
        mode: 'mode',
        id: 0,
        workflow: {
          isActive: true,
        },
      },
    },
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [ConfirmationDialogService, provideMockStore({ initialState: initialAppState }), PreviousRouteService],
        imports: [RouterTestingModule.withRoutes([]), FormsModule],
        declarations: [WorkflowFormComponent],
      }).compileComponents();
      previousRouteService = TestBed.inject(PreviousRouteService);
      router = TestBed.inject(Router);
      confirmationDialogService = TestBed.inject(ConfirmationDialogService);
      store = TestBed.inject(Store);
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowFormComponent);
    underTest = fixture.componentInstance;

    underTest.workflowData = {
      details: [],
      sensor: [],
      jobs: [],
    };
    underTest.workflowFormParts = WorkflowFormPartsModelFactory.create(undefined, undefined, undefined, undefined, undefined);
    underTest.id = 10;
    underTest.mode = 'Show';
    underTest.backendValidationErrors = [];
    underTest.changes = new Subject<Action>();
    underTest.isWorkflowActive = true;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

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

  it(
    'deleteWorkflow() should dispatch delete workflow action with id when dialog is confirmed',
    waitForAsync(() => {
      const id = 1;
      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');

      const dialogServiceSpy = spyOn(confirmationDialogService, 'confirm').and.returnValue(subject.asObservable());

      underTest.deleteWorkflow(id);
      subject.next(true);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(dialogServiceSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledWith(new DeleteWorkflow(id));
      });
    }),
  );

  it(
    'deleteWorkflow() should not dispatch delete workflow action when dialog is not confirmed',
    waitForAsync(() => {
      const id = 1;
      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');

      const dialogServiceSpy = spyOn(confirmationDialogService, 'confirm').and.returnValue(subject.asObservable());

      underTest.deleteWorkflow(id);
      subject.next(false);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(dialogServiceSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledTimes(0);
      });
    }),
  );

  it(
    'switchWorkflowActiveState() should dispatch switch workflow active state with id and old value when dialog is confirmed',
    waitForAsync(() => {
      const id = 1;
      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');

      const dialogServiceSpy = spyOn(confirmationDialogService, 'confirm').and.returnValue(subject.asObservable());

      underTest.switchWorkflowActiveState(id);

      subject.next(true);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(dialogServiceSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledWith(
          new SwitchWorkflowActiveState({ id: id, currentActiveState: initialAppState.workflows.workflowAction.workflow.isActive }),
        );
      });
    }),
  );

  it(
    'switchWorkflowActiveState() should not dispatch switch workflow active state when dialog is not confirmed',
    waitForAsync(() => {
      const id = 1;
      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');

      const dialogServiceSpy = spyOn(confirmationDialogService, 'confirm').and.returnValue(subject.asObservable());

      underTest.switchWorkflowActiveState(id);
      subject.next(false);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(dialogServiceSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledTimes(0);
      });
    }),
  );

  it(
    'runWorkflow() should dispatch load jobs for run',
    waitForAsync(() => {
      const id = 42;
      const storeSpy = spyOn(store, 'dispatch');

      underTest.runWorkflow(id);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(storeSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledWith(new LoadJobsForRun(id));
      });
    }),
  );

  it(
    'exportWorkflow() should dispatch workflow export',
    waitForAsync(() => {
      const id = 42;
      const storeSpy = spyOn(store, 'dispatch');

      underTest.exportWorkflow(id);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(storeSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledWith(new ExportWorkflows([id]));
      });
    }),
  );

  it(
    'createWorkflow() should dispatch create workflow when dialog is confirmed',
    waitForAsync(() => {
      underTest.workflowForm = { form: { valid: true } };

      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');

      const dialogServiceSpy = spyOn(confirmationDialogService, 'confirm').and.returnValue(subject.asObservable());

      underTest.createWorkflow();

      subject.next(true);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(dialogServiceSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledWith(new CreateWorkflow());
      });
    }),
  );

  it(
    'createWorkflow() should not dispatch create workflow when dialog is not confirmed',
    waitForAsync(() => {
      const id = 1;
      underTest.workflowForm = { form: { valid: true } };
      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');

      const dialogServiceSpy = spyOn(confirmationDialogService, 'confirm').and.returnValue(subject.asObservable());

      underTest.createWorkflow();
      subject.next(false);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(dialogServiceSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledTimes(0);
      });
    }),
  );

  it(
    'hasWorkflowChanged() should return false if workflowData has not changed',
    waitForAsync(() => {
      underTest.initialWorkflowData = {
        details: [],
        sensor: [],
        jobs: [],
      };

      expect(underTest.hasWorkflowChanged()).toBeFalse();
    }),
  );

  it(
    'hasWorkflowChanged() should return true if workflowData has changed',
    waitForAsync(() => {
      const detail = [WorkflowEntryModelFactory.create('projectX', 'project')];
      const sensors = [WorkflowEntryModelFactory.create('properties.settings.variables.cronExpression', '0 0/30 * ? * * *')];
      const job = [JobEntryModelFactory.create('uis99', 1, [WorkflowEntryModelFactory.create('name', 'workflowName')])];

      underTest.initialWorkflowData = {
        details: detail,
        sensor: sensors,
        jobs: job,
      };

      expect(underTest.hasWorkflowChanged()).toBeTrue();
    }),
  );

  it(
    'areWorkflowEntriesEqual() should return true if entries are empty',
    waitForAsync(() => {
      expect(underTest.areWorkflowEntriesEqual([], [])).toBeTrue();
    }),
  );

  it(
    'areWorkflowEntriesEqual() should return true if entries are equal',
    waitForAsync(() => {
      const firstEntry = WorkflowEntryModelFactory.create('first', 'first');
      const secondEntry = WorkflowEntryModelFactory.create('second', 'second');
      const thirdEntry = WorkflowEntryModelFactory.create('third', 'third');

      expect(underTest.areWorkflowEntriesEqual([firstEntry, secondEntry, thirdEntry], [firstEntry, secondEntry, thirdEntry])).toBeTrue();
      expect(underTest.areWorkflowEntriesEqual([firstEntry, secondEntry, thirdEntry], [secondEntry, firstEntry, thirdEntry])).toBeTrue();
    }),
  );

  it(
    'areWorkflowEntriesEqual() should return false if entries are not equal',
    waitForAsync(() => {
      const firstEntry = WorkflowEntryModelFactory.create('first', 'first');
      const secondEntry = WorkflowEntryModelFactory.create('second', 'second');

      expect(underTest.areWorkflowEntriesEqual([firstEntry], [firstEntry, secondEntry])).toBeFalsy();
      expect(underTest.areWorkflowEntriesEqual([firstEntry, secondEntry], [firstEntry])).toBeFalsy();
    }),
  );

  it(
    'areJobsEqual() should return true if entries are empty',
    waitForAsync(() => {
      expect(underTest.areJobsEqual([], [])).toBeTrue();
    }),
  );

  it(
    'areJobsEqual() should return true if entries are equal',
    waitForAsync(() => {
      const firstEntry = WorkflowEntryModelFactory.create('first', 'first');
      const secondEntry = WorkflowEntryModelFactory.create('second', 'second');
      const thirdEntry = WorkflowEntryModelFactory.create('third', 'third');

      expect(
        underTest.areJobsEqual(
          [JobEntryModelFactory.createWithUuid(0, [firstEntry, secondEntry, thirdEntry])],
          [JobEntryModelFactory.createWithUuid(1, [firstEntry, secondEntry, thirdEntry])],
        ),
      ).toBeTrue();
      expect(
        underTest.areJobsEqual(
          [JobEntryModelFactory.createWithUuid(1, [firstEntry, secondEntry, thirdEntry])],
          [JobEntryModelFactory.createWithUuid(0, [secondEntry, firstEntry, thirdEntry])],
        ),
      ).toBeTrue();
    }),
  );

  it(
    'areJobsEqual() should return false if entries differ in length',
    waitForAsync(() => {
      const firstEntry = WorkflowEntryModelFactory.create('first', 'first');
      const secondEntry = WorkflowEntryModelFactory.create('second', 'second');
      const thirdEntry = WorkflowEntryModelFactory.create('third', 'third');

      expect(underTest.areJobsEqual([JobEntryModelFactory.createWithUuid(0, [firstEntry, secondEntry, thirdEntry])], [])).toBeFalsy();
      expect(underTest.areJobsEqual([], [JobEntryModelFactory.createWithUuid(0, [firstEntry, secondEntry, thirdEntry])])).toBeFalsy();
    }),
  );

  it(
    'areJobsEqual() should return false if entries are not equal',
    waitForAsync(() => {
      const firstEntry = WorkflowEntryModelFactory.create('first', 'first');
      const secondEntry = WorkflowEntryModelFactory.create('second', 'second');

      expect(
        underTest.areJobsEqual(
          [JobEntryModelFactory.createWithUuid(0, [firstEntry])],
          [JobEntryModelFactory.createWithUuid(0, [firstEntry, secondEntry])],
        ),
      ).toBeFalsy();
      expect(
        underTest.areJobsEqual(
          [JobEntryModelFactory.createWithUuid(0, [firstEntry, secondEntry])],
          [JobEntryModelFactory.createWithUuid(0, [firstEntry])],
        ),
      ).toBeFalsy();
    }),
  );

  it(
    'updateWorkflow() should dispatch update workflow when dialog is confirmed',
    waitForAsync(() => {
      underTest.workflowForm = { form: { valid: true } };

      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');

      const dialogServiceSpy = spyOn(confirmationDialogService, 'confirm').and.returnValue(subject.asObservable());

      underTest.updateWorkflow();

      subject.next(true);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(dialogServiceSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledWith(new UpdateWorkflow());
      });
    }),
  );

  it(
    'updateWorkflow() should not dispatch update workflow when dialog is not confirmed',
    waitForAsync(() => {
      const id = 1;
      underTest.workflowForm = { form: { valid: true } };
      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');

      const dialogServiceSpy = spyOn(confirmationDialogService, 'confirm').and.returnValue(subject.asObservable());

      underTest.updateWorkflow();
      subject.next(false);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(dialogServiceSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledTimes(0);
      });
    }),
  );

  it('cancelWorkflow() should navigate back when history is not empty', () => {
    const testUrl = 'test/url';
    const dialogServiceSpy = spyOn(previousRouteService, 'getPreviousUrl').and.returnValue(testUrl);
    const routerSpy = spyOn(router, 'navigateByUrl');

    underTest.cancelWorkflow();
    expect(dialogServiceSpy).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledTimes(1);
    expect(routerSpy).toHaveBeenCalledWith(testUrl);
  });

  it('cancelWorkflow() should navigate to workflows home when history is empty', () => {
    const dialogServiceSpy = spyOn(previousRouteService, 'getPreviousUrl').and.returnValue(undefined);
    const routerSpy = spyOn(router, 'navigateByUrl');
    underTest.cancelWorkflow();
    expect(dialogServiceSpy).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledTimes(1);
    expect(routerSpy).toHaveBeenCalledWith(absoluteRoutes.WORKFLOWS_HOME);
  });

  it('showHiddenParts() should show hidden parts', () => {
    const jobsUnfoldSpy = spyOn(underTest.jobsUnfold, 'emit');
    underTest.isDetailsAccordionHidden = true;
    underTest.isSensorAccordionHidden = true;
    underTest.isJobsAccordionHidden = true;

    underTest.showHiddenParts();

    expect(underTest.isDetailsAccordionHidden).toBeFalsy();
    expect(underTest.isSensorAccordionHidden).toBeFalsy();
    expect(underTest.isJobsAccordionHidden).toBeFalsy();
    expect(jobsUnfoldSpy).toHaveBeenCalledTimes(1);
  });

  it(
    'removeBackendValidationError() should dispatch remove backend validation error action',
    waitForAsync(() => {
      const index = 2;

      const storeSpy = spyOn(store, 'dispatch');

      underTest.removeBackendValidationError(index);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(storeSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledWith(new RemoveBackendValidationError(index));
      });
    }),
  );

  it(
    'getJobsData() should return jobs data ordered by order number',
    waitForAsync(() => {
      const jobOne = JobEntryModelFactory.create('1', 1, undefined);
      const jobTwo = JobEntryModelFactory.create('2', 2, undefined);

      underTest.workflowData = {
        details: [],
        sensor: [],
        jobs: [jobTwo, jobOne],
      };

      const jobsData = underTest.getJobsData();
      expect(jobsData).toEqual([jobOne, jobTwo]);
    }),
  );
});
