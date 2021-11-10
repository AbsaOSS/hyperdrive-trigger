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
import { WorkflowHistoryComponent } from '../../../workflows/workflow-history/workflow-history.component';
import { HistoryModelFactory } from '../../../../models/historyModel';
import {JobTemplateHistoryComponent} from "./job-template-history.component";
import {LoadHistoryForJobTemplate} from "../../../../stores/job-templates/job-templates.actions";
import {Store} from "@ngrx/store";
import {AppState} from "../../../../stores/app.reducers";
import {Subject} from "rxjs";
import {ActivatedRoute, Params} from "@angular/router";
import {PreviousRouteService} from "../../../../services/previousRoute/previous-route.service";

describe('JobTemplateHistoryComponent', () => {
  let underTest: JobTemplateHistoryComponent;
  let fixture: ComponentFixture<JobTemplateHistoryComponent>;
  let store: Store<AppState>;
  const routeParams: Subject<Params> = new Subject<Params>();

  const historyRecordOne = HistoryModelFactory.create(1, new Date(Date.now()), 'userName', { name: 'Create' });
  const historyRecordTwo = HistoryModelFactory.create(2, new Date(Date.now()), 'userName', { name: 'Update' });
  const historyRecordThree = HistoryModelFactory.create(3, new Date(Date.now()), 'userName', { name: 'Update' });

  const initialAppState = {
    jobTemplates: {
      history: {
        loading: true,
        historyEntries: [historyRecordOne, historyRecordTwo, historyRecordThree],
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
        declarations: [WorkflowHistoryComponent],
        imports: [RouterTestingModule.withRoutes([]), FormsModule],
      }).compileComponents();
      store = TestBed.inject(Store);
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(JobTemplateHistoryComponent);
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
        expect(underTest.loading).toBe(initialAppState.jobTemplates.history.loading);
        expect(underTest.jobTemplateHistory).toBe(initialAppState.jobTemplates.history.historyEntries);
      });
    }),
  );

  it(
    'when route is changed it should set id and dispatch load history for job template',
    waitForAsync(() => {
      const newRouteParams = { id: 1 };
      const usedAction = new LoadHistoryForJobTemplate(newRouteParams.id);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const storeSpy = spyOn(store, 'dispatch');
        routeParams.next(newRouteParams);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(underTest.id).toBe(newRouteParams.id);
          expect(storeSpy).toHaveBeenCalledTimes(1);
          expect(storeSpy).toHaveBeenCalledWith(usedAction);
        });
      });
    }),
  );

  it(
    'isSelectable() should return false when 2 history records are selected',
    waitForAsync(() => {
      underTest.jobTemplateHistory = [historyRecordOne, historyRecordTwo, historyRecordThree];
      underTest.selected = [historyRecordOne, historyRecordTwo];

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(underTest.isSelectable(historyRecordThree)).toBeFalsy();
      });
    }),
  );
});
