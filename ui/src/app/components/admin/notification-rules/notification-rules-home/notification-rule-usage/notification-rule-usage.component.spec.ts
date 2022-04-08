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
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { AppState } from '../../../../../stores/app.reducers';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { absoluteRoutes } from '../../../../../constants/routes.constants';
import { NotificationRuleUsageComponent } from './notification-rule-usage.component';
import { GetNotificationRuleUsage } from '../../../../../stores/notification-rules/notification-rules.actions';

describe('NotificationRuleUsageComponent', () => {
  let underTest: NotificationRuleUsageComponent;
  let fixture: ComponentFixture<NotificationRuleUsageComponent>;
  let store: Store<AppState>;
  let router: Router;

  const initialAppState = {
    notificationRules: {
      usage: {
        loading: true,
        workflows: [],
      },
    },
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [provideMockStore({ initialState: initialAppState })],
        declarations: [NotificationRuleUsageComponent],
        imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      }).compileComponents();
      store = TestBed.inject(Store);
      router = TestBed.inject(Router);
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationRuleUsageComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it(
    'onInit should set component properties',
    waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(underTest.loading).toBe(initialAppState.notificationRules.usage.loading);
        expect(underTest.workflows).toBe(initialAppState.notificationRules.usage.workflows);
      });
    }),
  );

  it(
    'onRefresh() should dispatch GetNotificationRuleUsage',
    waitForAsync(() => {
      underTest.notificationId = 42;
      underTest.refreshSubject = new Subject<boolean>();
      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');

      underTest.onRefresh();
      subject.next(true);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(storeSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledWith(new GetNotificationRuleUsage(underTest.notificationId));
      });
    }),
  );

  it(
    'showWorkflow() should navigate to show workflow page',
    waitForAsync(() => {
      const id = 42;
      const routerSpy = spyOn(router, 'navigate');

      underTest.showWorkflow(id);

      expect(routerSpy).toHaveBeenCalledTimes(1);
      expect(routerSpy).toHaveBeenCalledWith([absoluteRoutes.SHOW_WORKFLOW, id]);
    }),
  );
});
