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
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../stores/app.reducers';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { JobTemplateComponent } from './job-template.component';

describe('JobTemplateComponent', () => {
  let underTest: JobTemplateComponent;
  let fixture: ComponentFixture<JobTemplateComponent>;
  let router: Router;
  let store: Store<AppState>;

  const initialAppState = {
    jobTemplates: {
      jobTemplateAction: {
        id: undefined,
        mode: undefined,
        loading: true,
      },
    },
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState: initialAppState }),
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({
              id: 10,
              mode: 'mode',
            }),
          },
        },
      ],
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [JobTemplateComponent],
    }).compileComponents();
    router = TestBed.inject(Router);
    store = TestBed.inject(Store);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobTemplateComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it('should set properties during on init', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.loading).toBe(initialAppState.jobTemplates.jobTemplateAction.loading);
      expect(underTest.mode).toBe(initialAppState.jobTemplates.jobTemplateAction.mode);
      expect(underTest.id).toBe(initialAppState.jobTemplates.jobTemplateAction.id);
    });
  }));
});
