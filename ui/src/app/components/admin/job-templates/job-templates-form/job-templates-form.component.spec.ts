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
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { JobTemplatesFormComponent } from './job-templates-form.component';
import { PreviousRouteService } from '../../../../services/previousRoute/previous-route.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { createSpyFromClass, Spy } from 'jasmine-auto-spies';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../stores/app.reducers';
import { ConfirmationDialogService } from '../../../../services/confirmation-dialog/confirmation-dialog.service';
import { JobTemplateModelFactory } from '../../../../models/jobTemplate.model';
import {
  CreateJobTemplate,
  DeleteJobTemplate,
  JobTemplateChanged,
  RemoveJobTemplateBackendValidationError,
  UpdateJobTemplate,
} from '../../../../stores/job-templates/job-templates.actions';
import { absoluteRoutes } from '../../../../constants/routes.constants';
import { jobTypes, jobTypesMap } from '../../../../constants/jobTypes.constants';
import { ShellTemplateParametersModel } from '../../../../models/jobTemplateParameters.model';

describe('JobTemplatesFormComponent', () => {
  let underTest: JobTemplatesFormComponent;
  let fixture: ComponentFixture<JobTemplatesFormComponent>;
  let previousRouteService: PreviousRouteService;
  let router;
  let store: Store<AppState>;
  let confirmationDialogServiceSpy: Spy<ConfirmationDialogService>;

  const dummyJobTemplate = JobTemplateModelFactory.createEmpty();

  const initialAppState = {
    jobTemplates: {
      jobTemplateAction: {
        id: 10,
        loading: false,
        initialJobTemplate: dummyJobTemplate,
        jobTemplate: dummyJobTemplate,
        backendValidationErrors: [],
      },
    },
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [
          provideMockStore({ initialState: initialAppState }),
          PreviousRouteService,
          { provide: ConfirmationDialogService, useValue: createSpyFromClass(ConfirmationDialogService) },
        ],
        declarations: [JobTemplatesFormComponent],
        imports: [RouterTestingModule.withRoutes([]), FormsModule],
      }).compileComponents();
      previousRouteService = TestBed.inject(PreviousRouteService);
      router = TestBed.inject(Router);
      store = TestBed.inject(Store);
      confirmationDialogServiceSpy = TestBed.inject<any>(ConfirmationDialogService);
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(JobTemplatesFormComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it(
    'createJobTemplate() should dispatch create job template when dialog is confirmed',
    waitForAsync(() => {
      underTest.jobTemplateForm = { form: { valid: true } };

      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');

      const dialogServiceSpy = confirmationDialogServiceSpy.confirm.and.returnValue(subject.asObservable());

      underTest.createJobTemplate();

      subject.next(true);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(dialogServiceSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledWith(new CreateJobTemplate());
      });
    }),
  );

  it(
    'createJobTemplate() should not dispatch create job template when dialog is not confirmed',
    waitForAsync(() => {
      underTest.jobTemplateForm = { form: { valid: true } };
      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');

      const dialogServiceSpy = confirmationDialogServiceSpy.confirm.and.returnValue(subject.asObservable());

      underTest.createJobTemplate();
      subject.next(false);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(dialogServiceSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledTimes(0);
      });
    }),
  );

  it(
    'updateJobTemplate() should dispatch update job template when dialog is confirmed',
    waitForAsync(() => {
      underTest.jobTemplateForm = { form: { valid: true } };

      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');

      const dialogServiceSpy = confirmationDialogServiceSpy.confirm.and.returnValue(subject.asObservable());

      underTest.updateJobTemplate();

      subject.next(true);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(dialogServiceSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledWith(new UpdateJobTemplate());
      });
    }),
  );

  it(
    'updateJobTemplate() should not dispatch update job template when dialog is not confirmed',
    waitForAsync(() => {
      underTest.jobTemplateForm = { form: { valid: true } };
      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');

      const dialogServiceSpy = confirmationDialogServiceSpy.confirm.and.returnValue(subject.asObservable());

      underTest.updateJobTemplate();
      subject.next(false);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(dialogServiceSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledTimes(0);
      });
    }),
  );

  it(
    'deleteJobTemplate() should dispatch delete job template action with id when dialog is confirmed',
    waitForAsync(() => {
      const id = 1;
      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');

      const dialogServiceSpy = confirmationDialogServiceSpy.confirm.and.returnValue(subject.asObservable());

      underTest.deleteJobTemplate(id);
      subject.next(true);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(dialogServiceSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledWith(new DeleteJobTemplate(id));
      });
    }),
  );

  it(
    'deleteJobTemplate() should not dispatch delete job template action when dialog is not confirmed',
    waitForAsync(() => {
      const id = 1;
      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');

      const dialogServiceSpy = confirmationDialogServiceSpy.confirm.and.returnValue(subject.asObservable());

      underTest.deleteJobTemplate(id);
      subject.next(false);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(dialogServiceSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledTimes(0);
      });
    }),
  );

  it('cancel() should navigate back when history is not empty', () => {
    const testUrl = 'test/url';
    const dialogServiceSpy = spyOn(previousRouteService, 'getPreviousUrl').and.returnValue(testUrl);
    const routerSpy = spyOn(router, 'navigateByUrl');

    underTest.cancel();
    expect(dialogServiceSpy).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledTimes(1);
    expect(routerSpy).toHaveBeenCalledWith(testUrl);
  });

  it('cancel() should navigate to job templates home when history is empty', () => {
    const dialogServiceSpy = spyOn(previousRouteService, 'getPreviousUrl').and.returnValue(undefined);
    const routerSpy = spyOn(router, 'navigateByUrl');
    underTest.cancel();
    expect(dialogServiceSpy).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledTimes(1);
    expect(routerSpy).toHaveBeenCalledWith(absoluteRoutes.JOB_TEMPLATES_HOME);
  });

  it(
    'formHasChanged() should return false if job template has not changed',
    waitForAsync(() => {
      underTest.initialJobTemplate = dummyJobTemplate;
      underTest.jobTemplate = dummyJobTemplate;

      expect(underTest.formHasChanged()).toBeFalse();
    }),
  );

  it(
    'formHasChanged() should return true if job template has changed',
    waitForAsync(() => {
      underTest.initialJobTemplate = dummyJobTemplate;
      underTest.jobTemplate = {
        ...dummyJobTemplate,
        name: 'updatedName',
      };
      expect(underTest.formHasChanged()).toBeTrue();
    }),
  );

  it(
    'removeBackendValidationError() should dispatch remove backend validation error action',
    waitForAsync(() => {
      const index = 2;

      const storeSpy = spyOn(store, 'dispatch');

      underTest.removeBackendValidationError(index);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(storeSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledWith(new RemoveJobTemplateBackendValidationError(index));
      });
    }),
  );

  it('should dispatch job template change when nameChange() is called', () => {
    underTest.jobTemplate = dummyJobTemplate;

    const storeSpy = spyOn(store, 'dispatch');

    const newName = 'newName';
    const newJobTemplate = { ...underTest.jobTemplate, name: newName };

    underTest.nameChange(newName);

    expect(storeSpy).toHaveBeenCalled();
    expect(storeSpy).toHaveBeenCalledWith(new JobTemplateChanged(newJobTemplate));
  });

  it('should dispatch job template change when jobTypeChange() is called', () => {
    underTest.jobTemplate = dummyJobTemplate;

    const storeSpy = spyOn(store, 'dispatch');

    const newJobTemplateType = jobTypes.SHELL;
    const newJobTemplate = { ...underTest.jobTemplate, jobParameters: ShellTemplateParametersModel.createEmpty() };

    underTest.jobTypeChange(newJobTemplateType);

    expect(storeSpy).toHaveBeenCalled();
    expect(storeSpy).toHaveBeenCalledWith(new JobTemplateChanged(newJobTemplate));
  });

  it('should dispatch job template change when jobParametersChange() is called', () => {
    underTest.jobTemplate = dummyJobTemplate;

    const storeSpy = spyOn(store, 'dispatch');

    const newJobParams = ShellTemplateParametersModel.createEmpty();
    const newJobTemplate = { ...underTest.jobTemplate, jobParameters: newJobParams };

    underTest.jobParametersChange(newJobParams);

    expect(storeSpy).toHaveBeenCalled();
    expect(storeSpy).toHaveBeenCalledWith(new JobTemplateChanged(newJobTemplate));
  });

  it('toggleJobTemplateInfoAccordion() should toggle job template info accordion', () => {
    expect(underTest.isJobTemplateInfoHidden).toBeFalse();
    underTest.toggleJobTemplateInfoAccordion();
    expect(underTest.isJobTemplateInfoHidden).toBeTrue();
  });

  it('toggleJobTemplateParametersAccordion() should toggle job template accordion', () => {
    expect(underTest.isJobTemplateParametersHidden).toBeFalse();
    underTest.toggleJobTemplateParametersAccordion();
    expect(underTest.isJobTemplateParametersHidden).toBeTrue();
  });

  it(
    'getJobTypes() should return all job types if input type is shell',
    waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const result = underTest.getJobTypes(jobTypes.SHELL);
        expect(result).toEqual(jobTypesMap);
      });
    }),
  );

  it(
    'getJobTypes() should return job types without shell if input type is not shell',
    waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const result = underTest.getJobTypes(jobTypes.SPARK);
        expect(result.size).toEqual(jobTypesMap.size - 1);
      });
    }),
  );
});
