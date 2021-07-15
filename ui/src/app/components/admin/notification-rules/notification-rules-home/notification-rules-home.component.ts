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

import { AfterViewInit, Component, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { ClrDatagridColumn, ClrDatagridStateInterface } from '@clr/angular';
import { SortAttributesModel } from '../../../../models/search/sortAttributes.model';
import { TableSearchRequestModelFactory } from '../../../../models/search/tableSearchRequest.model';
import { Subject, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectNotificationRulesState } from '../../../../stores/app.reducers';
import { skip } from 'rxjs/operators';
import { notificationRuleColumns } from '../../../../constants/notificationRuleColumns.constants';
import { DeleteNotificationRule, SearchNotificationRules } from '../../../../stores/notification-rules/notification-rules.actions';
import { absoluteRoutes } from 'src/app/constants/routes.constants';
import { Router } from '@angular/router';
import { NotificationRuleModel } from '../../../../models/notificationRule.model';
import { ConfirmationDialogTypes } from '../../../../constants/confirmationDialogTypes.constants';
import { texts } from '../../../../constants/texts.constants';
import { ConfirmationDialogService } from '../../../../services/confirmation-dialog/confirmation-dialog.service';
import { FilterAttributes } from '../../../../models/search/filterAttributes.model';

@Component({
  selector: 'app-notification-rules-home',
  templateUrl: './notification-rules-home.component.html',
  styleUrls: ['./notification-rules-home.component.scss'],
})
export class NotificationRulesHomeComponent implements AfterViewInit, OnDestroy {
  @ViewChildren(ClrDatagridColumn) columns: QueryList<ClrDatagridColumn>;

  notificationRulesSubscription: Subscription = null;
  confirmationDialogServiceSubscription: Subscription = null;

  page = 1;
  pageFrom = 0;
  pageSize = 0;
  sort: SortAttributesModel = null;

  notificationRules: NotificationRuleModel[] = [];
  total = 0;
  loading = true;
  filters: FilterAttributes[] = [];

  notificationRuleColumns = notificationRuleColumns;
  absoluteRoutes = absoluteRoutes;

  removeFiltersSubject: Subject<any> = new Subject();
  refreshSubject: Subject<boolean> = new Subject<boolean>();

  constructor(private store: Store<AppState>, private router: Router, private confirmationDialogService: ConfirmationDialogService) {}

  ngAfterViewInit(): void {
    this.notificationRulesSubscription = this.store
      .select(selectNotificationRulesState)
      .pipe(skip(1))
      .subscribe((state) => {
        this.notificationRules = state.notificationRules;
        this.total = state.total;
        this.loading = state.loading;
        this.page = state.page;
      });
  }

  onClarityDgRefresh(state: ClrDatagridStateInterface) {
    this.sort = state.sort ? new SortAttributesModel(state.sort.by as string, state.sort.reverse ? -1 : 1) : undefined;
    this.pageFrom = state.page.from < 0 ? 0 : state.page.from;
    this.pageSize = state.page.size;
    this.filters = state.filters ? state.filters : [];

    this.refresh();
  }

  refresh() {
    const searchRequestModel = TableSearchRequestModelFactory.create(this.pageFrom, this.pageSize, this.sort, this.filters);
    this.store.dispatch(new SearchNotificationRules(searchRequestModel));
    this.refreshSubject.next(true);
  }

  clearFilters() {
    this.removeFiltersSubject.next();
  }

  clearSort() {
    if (!!this.sort) {
      this.columns.find((_) => _.field == this.sort.by).sortOrder = 0;
    }
  }

  showNotificationRule(id: number) {
    this.router.navigate([absoluteRoutes.SHOW_NOTIFICATION_RULE, id]);
  }

  deleteNotificationRule(id: number): void {
    this.confirmationDialogServiceSubscription = this.confirmationDialogService
      .confirm(
        ConfirmationDialogTypes.Delete,
        texts.DELETE_NOTIFICATION_RULE_CONFIRMATION_TITLE,
        texts.DELETE_NOTIFICATION_RULE_CONFIRMATION_CONTENT,
      )
      .subscribe((confirmed) => {
        if (confirmed) this.store.dispatch(new DeleteNotificationRule(id));
      });
  }

  ngOnDestroy(): void {
    !!this.notificationRulesSubscription && this.notificationRulesSubscription.unsubscribe();
    !!this.confirmationDialogServiceSubscription && this.confirmationDialogServiceSubscription.unsubscribe();
  }
}
