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
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import { NotificationRuleModelFactory } from '../../../../models/notificationRule.model';
import { dagInstanceStatuses } from '../../../../models/enums/dagInstanceStatuses.constants';
import { NotificationRuleComponent } from './notification-rule.component';
import { AppState } from '../../../../stores/app.reducers';
import { PreviousRouteService } from '../../../../services/previousRoute/previous-route.service';

describe('NotificationRuleComponent', () => {
  let underTest: NotificationRuleComponent;
  let fixture: ComponentFixture<NotificationRuleComponent>;
  let router: Router;
  let store: Store<AppState>;
  let previousRouteService: PreviousRouteService;

  const dummyNotificationRule = NotificationRuleModelFactory.create(
    true,
    'Project 1',
    undefined,
    7200,
    [dagInstanceStatuses.SUCCEEDED.name, dagInstanceStatuses.FAILED.name],
    ['abc@xyz.com'],
    new Date(Date.now()),
    undefined,
    1,
  );

  const initialAppState = {
    notificationRules: {
      notificationRuleAction: {
        id: 10,
        backendValidationErrors: [],
        loading: false,
        initialNotificationRule: NotificationRuleModelFactory.createEmpty(),
        notificationRule: dummyNotificationRule,
      },
    },
    workflows: {
      projects: [
        { name: 'projectA', workflows: [] },
        { name: 'projectB', workflows: [] },
      ],
    },
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [
          PreviousRouteService,
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
        imports: [RouterTestingModule.withRoutes([])],
        declarations: [NotificationRuleComponent],
      }).compileComponents();
      previousRouteService = TestBed.inject(PreviousRouteService);
      router = TestBed.inject(Router);
      store = TestBed.inject(Store);
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationRuleComponent);
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
        expect(underTest.loading).toBe(initialAppState.notificationRules.notificationRuleAction.loading);
        expect(underTest.backendValidationErrors).toBe(initialAppState.notificationRules.notificationRuleAction.backendValidationErrors);
        expect(underTest.initialNotificationRule).toBe(initialAppState.notificationRules.notificationRuleAction.initialNotificationRule);
        expect(underTest.notificationRule).toBe(initialAppState.notificationRules.notificationRuleAction.notificationRule);
        expect(underTest.notificationRuleStatuses).toEqual(
          initialAppState.notificationRules.notificationRuleAction.notificationRule.statuses,
        );
      });
    }),
  );
});
