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

import { RunDetailComponent } from './run-detail.component';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppState } from '../../../stores/app.reducers';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { GetDagRunDetail } from '../../../stores/runs/runs.actions';
import { AppInfoModelFactory } from '../../../models/appInfo.model';

describe('RunDetailComponent', () => {
  let underTest: RunDetailComponent;
  let fixture: ComponentFixture<RunDetailComponent>;
  let store: Store<AppState>;

  const initialAppState = {
    application: {
      appInfo: AppInfoModelFactory.create('Undefined', 'Undefined', 'Undefined'),
    },
    runs: {
      detail: {
        loading: true,
        jobInstances: [],
      },
    },
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({ initialState: initialAppState })],
      declarations: [RunDetailComponent],
      imports: [HttpClientTestingModule],
    }).compileComponents();
    store = TestBed.inject(Store);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunDetailComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it('onInit should set component properties', waitForAsync(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.loading).toBe(initialAppState.runs.detail.loading);
      expect(underTest.jobInstances).toBe(initialAppState.runs.detail.jobInstances);
    });
  }));

  it('onRefresh() should dispatch GetDagRunDetail', waitForAsync(() => {
    underTest.dagRunId = 42;
    underTest.refreshSubject = new Subject<boolean>();
    const subject = new Subject<boolean>();
    const storeSpy = spyOn(store, 'dispatch');

    underTest.onRefresh();
    subject.next(true);

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(storeSpy).toHaveBeenCalled();
      expect(storeSpy).toHaveBeenCalledWith(new GetDagRunDetail(underTest.dagRunId));
    });
  }));

  it('getApplicationId() should return a valid url ', waitForAsync(() => {
    const expectedUrl = 'http://localhost:8088/cluster/app/applicationId_1234';
    const url1 = underTest.getApplicationIdUrl('http://localhost:8088', 'applicationId_1234');
    expect(url1).toBe(expectedUrl);
    const url2 = underTest.getApplicationIdUrl('http://localhost:8088/', 'applicationId_1234');
    expect(url2).toBe(expectedUrl);
    const url3 = underTest.getApplicationIdUrl('http://localhost:8088', '/applicationId_1234');
    expect(url3).toBe(expectedUrl);
  }));
});
