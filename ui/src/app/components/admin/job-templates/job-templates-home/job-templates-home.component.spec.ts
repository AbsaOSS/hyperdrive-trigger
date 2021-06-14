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

import { JobTemplatesHomeComponent } from './job-templates-home.component';
import { provideMockStore } from '@ngrx/store/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { absoluteRoutes } from '../../../../constants/routes.constants';
import { JobTemplateModelFactory } from '../../../../models/jobTemplate.model';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../stores/app.reducers';
import { ClrDatagridStateInterface } from '@clr/angular';
import { SparkTemplateParametersModel } from '../../../../models/jobTemplateParameters.model';

describe('JobTemplatesHomeComponent', () => {
  let underTest: JobTemplatesHomeComponent;
  let fixture: ComponentFixture<JobTemplatesHomeComponent>;
  let router: Router;
  let store: Store<AppState>;

  const initialAppState = {
    jobTemplates: {
      jobTemplates: [
        JobTemplateModelFactory.create(0, 'templateName', 'fromConfig', { name: 'jobType' }, SparkTemplateParametersModel.createEmpty()),
      ],
      total: 2,
      page: 3,
      loading: false,
    },
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [provideMockStore({ initialState: initialAppState })],
        declarations: [JobTemplatesHomeComponent],
        imports: [RouterTestingModule.withRoutes([])],
      }).compileComponents();
      router = TestBed.inject(Router);
      store = TestBed.inject(Store);
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(JobTemplatesHomeComponent);
    underTest = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it(
    'onClarityDgRefresh() should dispatch SearchJobTemplates action',
    waitForAsync(() => {
      const storeSpy = spyOn(store, 'dispatch');
      const removeFiltersSubjectSpy = spyOn(underTest.refreshSubject, 'next');
      const clrDatagridState: ClrDatagridStateInterface = {
        page: {
          from: 1,
          to: 2,
          size: 10,
          current: 3,
        },
        sort: {
          by: 'by',
          reverse: false,
        },
        filters: [],
      };

      underTest.onClarityDgRefresh(clrDatagridState);

      expect(removeFiltersSubjectSpy).toHaveBeenCalledTimes(1);
      expect(storeSpy).toHaveBeenCalledTimes(1);
    }),
  );

  it(
    'refresh() should dispatch SearchJobTemplates action',
    waitForAsync(() => {
      const storeSpy = spyOn(store, 'dispatch');
      const removeFiltersSubjectSpy = spyOn(underTest.refreshSubject, 'next');

      underTest.refresh();

      expect(removeFiltersSubjectSpy).toHaveBeenCalledTimes(1);
      expect(storeSpy).toHaveBeenCalledTimes(1);
    }),
  );

  it(
    'clearFilters() should call next on removeFiltersSubject',
    waitForAsync(() => {
      const removeFiltersSubjectSpy = spyOn(underTest.removeFiltersSubject, 'next');

      underTest.clearFilters();

      expect(removeFiltersSubjectSpy).toHaveBeenCalledTimes(1);
    }),
  );

  it(
    'showJobTemplate() should navigate to show job template page',
    waitForAsync(() => {
      const id = 42;
      const routerSpy = spyOn(router, 'navigate');

      underTest.showJobTemplate(id);

      expect(routerSpy).toHaveBeenCalledTimes(1);
      expect(routerSpy).toHaveBeenCalledWith([absoluteRoutes.SHOW_JOB_TEMPLATE, id]);
    }),
  );
});
