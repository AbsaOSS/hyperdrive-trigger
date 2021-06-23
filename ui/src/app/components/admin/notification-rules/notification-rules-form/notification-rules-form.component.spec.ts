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
import { Subject } from 'rxjs';
import { createSpyFromClass, Spy } from 'jasmine-auto-spies';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../stores/app.reducers';
import { ConfirmationDialogService } from '../../../../services/confirmation-dialog/confirmation-dialog.service';
import {
  CreateNotificationRule,
  DeleteNotificationRule,
  RemoveNotificationRuleBackendValidationError,
  UpdateNotificationRule,
} from '../../../../stores/notification-rules/notification-rules.actions';
import { absoluteRoutes } from '../../../../constants/routes.constants';

describe('NotificationRulesForm', () => {
  let underTest: NotificationRulesFormComponent;
  let fixture: ComponentFixture<NotificationRulesFormComponent>;
  let previousRouteService: PreviousRouteService;
  let router;
  let store: Store<AppState>;
  let confirmationDialogServiceSpy: Spy<ConfirmationDialogService>;

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
        providers: [
          provideMockStore({ initialState: initialAppState }),
          PreviousRouteService,
          { provide: ConfirmationDialogService, useValue: createSpyFromClass(ConfirmationDialogService) },
        ],
        declarations: [NotificationRulesFormComponent],
        imports: [RouterTestingModule.withRoutes([]), FormsModule],
      }).compileComponents();
      previousRouteService = TestBed.inject(PreviousRouteService);
      router = TestBed.inject(Router);
      store = TestBed.inject(Store);
      confirmationDialogServiceSpy = TestBed.inject<any>(ConfirmationDialogService);
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationRulesFormComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it(
    'CreateNotificationRule() should dispatch create notification rule when dialog is confirmed',
    waitForAsync(() => {
      underTest.notificationRulesForm = { form: { valid: true } };

      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');

      const dialogServiceSpy = confirmationDialogServiceSpy.confirm.and.returnValue(subject.asObservable());

      underTest.createNotificationRule();

      subject.next(true);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(dialogServiceSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledWith(new CreateNotificationRule());
      });
    }),
  );

  it(
    'CreateNotificationRule() should not dispatch create notification rule when dialog is not confirmed',
    waitForAsync(() => {
      const id = 1;
      underTest.notificationRulesForm = { form: { valid: true } };
      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');

      const dialogServiceSpy = confirmationDialogServiceSpy.confirm.and.returnValue(subject.asObservable());

      underTest.createNotificationRule();
      subject.next(false);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(dialogServiceSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledTimes(0);
      });
    }),
  );

  it(
    'UpdateNotificationRule() should dispatch update notification rule when dialog is confirmed',
    waitForAsync(() => {
      underTest.notificationRulesForm = { form: { valid: true } };

      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');

      const dialogServiceSpy = confirmationDialogServiceSpy.confirm.and.returnValue(subject.asObservable());

      underTest.updateNotificationRule();

      subject.next(true);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(dialogServiceSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledWith(new UpdateNotificationRule());
      });
    }),
  );

  it(
    'UpdateNotificationRule() should not dispatch update notification rule when dialog is not confirmed',
    waitForAsync(() => {
      const id = 1;
      underTest.notificationRulesForm = { form: { valid: true } };
      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');

      const dialogServiceSpy = confirmationDialogServiceSpy.confirm.and.returnValue(subject.asObservable());

      underTest.updateNotificationRule();
      subject.next(false);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(dialogServiceSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledTimes(0);
      });
    }),
  );

  it(
    'deleteNotificationRule() should dispatch delete notification rule action with id when dialog is confirmed',
    waitForAsync(() => {
      const id = 1;
      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');

      const dialogServiceSpy = confirmationDialogServiceSpy.confirm.and.returnValue(subject.asObservable());

      underTest.deleteNotificationRule(id);
      subject.next(true);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(dialogServiceSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledWith(new DeleteNotificationRule(id));
      });
    }),
  );

  it(
    'deleteNotificationRule() should not dispatch delete notification rule action when dialog is not confirmed',
    waitForAsync(() => {
      const id = 1;
      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');

      const dialogServiceSpy = confirmationDialogServiceSpy.confirm.and.returnValue(subject.asObservable());

      underTest.deleteNotificationRule(id);
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

  it('cancel() should navigate to notification rules home when history is empty', () => {
    const dialogServiceSpy = spyOn(previousRouteService, 'getPreviousUrl').and.returnValue(undefined);
    const routerSpy = spyOn(router, 'navigateByUrl');
    underTest.cancel();
    expect(dialogServiceSpy).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledTimes(1);
    expect(routerSpy).toHaveBeenCalledWith(absoluteRoutes.NOTIFICATION_RULES_HOME);
  });

  it(
    'formHasChanged() should return false if notificationRule has not changed',
    waitForAsync(() => {
      underTest.initialNotificationRule = dummyNotificationRule;
      underTest.notificationRule = dummyNotificationRule;

      expect(underTest.formHasChanged()).toBeFalse();
    }),
  );

  it(
    'formHasChanged() should return true if notificationRule has changed',
    waitForAsync(() => {
      underTest.initialNotificationRule = dummyNotificationRule;
      underTest.notificationRule = {
        ...dummyNotificationRule,
        statuses: [dagInstanceStatuses.SUCCEEDED.name],
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
        expect(storeSpy).toHaveBeenCalledWith(new RemoveNotificationRuleBackendValidationError(index));
      });
    }),
  );
});
