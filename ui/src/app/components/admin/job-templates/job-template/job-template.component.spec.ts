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
import { JobTemplateComponent } from './job-template.component';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { JobTemplateModelFactory } from '../../../../models/jobTemplate.model';
import { SparkTemplateParametersModel } from '../../../../models/jobTemplateParameters.model';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../stores/app.reducers';
import { Subject } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { PreviousRouteService } from '../../../../services/previousRoute/previous-route.service';
import { jobTemplateModes } from '../../../../models/enums/jobTemplateModes.constants';
import { GetJobTemplateForForm, SetEmptyJobTemplate } from '../../../../stores/job-templates/job-templates.actions';

describe('JobTemplateComponent', () => {
  let underTest: JobTemplateComponent;
  let fixture: ComponentFixture<JobTemplateComponent>;
  let store: Store<AppState>;
  const routeParams: Subject<Params> = new Subject<Params>();

  const initialAppState = {
    jobTemplates: {
      jobTemplateAction: {
        id: 10,
        loading: false,
        initialJobTemplate: JobTemplateModelFactory.create(0, 'templateName1', SparkTemplateParametersModel.createEmpty()),
        jobTemplate: JobTemplateModelFactory.create(1, 'templateName2', SparkTemplateParametersModel.createEmpty()),
        backendValidationErrors: [],
      },
    },
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [
          provideMockStore({ initialState: initialAppState }),
          {
            provide: ActivatedRoute,
            useValue: {
              params: routeParams,
            },
          },
          PreviousRouteService,
        ],
        declarations: [JobTemplateComponent],
        imports: [RouterTestingModule.withRoutes([]), FormsModule],
      }).compileComponents();
      store = TestBed.inject(Store);
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(JobTemplateComponent);
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
        expect(underTest.loading).toBe(initialAppState.jobTemplates.jobTemplateAction.loading);
        expect(underTest.jobTemplate).toBe(initialAppState.jobTemplates.jobTemplateAction.jobTemplate);
        expect(underTest.jobTemplateForForm).toBe(initialAppState.jobTemplates.jobTemplateAction.jobTemplate);
        expect(underTest.backendValidationErrors).toBe(initialAppState.jobTemplates.jobTemplateAction.backendValidationErrors);
      });
    }),
  );

  it(
    'when route is changed it should dispatch set empty job template on create mode',
    waitForAsync(() => {
      const newRouteParams = { mode: jobTemplateModes.CREATE };
      const usedAction = new SetEmptyJobTemplate();

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

  it(
    'when route is changed it should dispatch get job template on edit mode',
    waitForAsync(() => {
      const newRouteParams = { id: 1, mode: jobTemplateModes.EDIT };
      const usedAction = new GetJobTemplateForForm(newRouteParams.id);

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
