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
import { NotificationRulesFormComponent } from './notification-rules-form.component';
import { NotificationRuleModelFactory } from '../../../../models/notificationRule.model';
import { dagInstanceStatuses } from '../../../../models/enums/dagInstanceStatuses.constants';
import { PreviousRouteService } from '../../../../services/previousRoute/previous-route.service';
import { Router } from '@angular/router';

describe('NotificationRulesForm', () => {
  let underTest: NotificationRulesFormComponent;
  let fixture: ComponentFixture<NotificationRulesFormComponent>;
  let previousRouteService: PreviousRouteService;
  let router;

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
        loading: false,
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
        providers: [provideMockStore({ initialState: initialAppState }), PreviousRouteService],
        declarations: [NotificationRulesFormComponent],
        imports: [RouterTestingModule.withRoutes([]), FormsModule],
      }).compileComponents();
      previousRouteService = TestBed.inject(PreviousRouteService);
      router = TestBed.inject(Router);
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationRulesFormComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });
});
