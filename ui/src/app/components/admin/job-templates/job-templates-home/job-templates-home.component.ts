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
import { JobTemplateModel } from '../../../../models/jobTemplate.model';
import { Subject, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectJobTemplatesState } from '../../../../stores/app.reducers';
import { skip } from 'rxjs/operators';
import { jobTemplateColumns } from '../../../../constants/jobTemplateColumns.constants';
import { SearchJobTemplates } from '../../../../stores/job-templates/job-templates.actions';
import { absoluteRoutes } from 'src/app/constants/routes.constants';
import { Router } from '@angular/router';
import { FilterAttributes } from '../../../../models/search/filterAttributes.model';

@Component({
  selector: 'app-job-templates-home',
  templateUrl: './job-templates-home.component.html',
  styleUrls: ['./job-templates-home.component.scss'],
})
export class JobTemplatesHomeComponent implements AfterViewInit, OnDestroy {
  @ViewChildren(ClrDatagridColumn) columns: QueryList<ClrDatagridColumn>;

  templatesSubscription: Subscription = null;

  page = 1;
  pageFrom = 0;
  pageSize = 0;
  sort: SortAttributesModel = null;

  jobTemplates: JobTemplateModel[] = [];
  total = 0;
  loading = true;
  filters: FilterAttributes[] = [];

  jobTemplateColumns = jobTemplateColumns;
  absoluteRoutes = absoluteRoutes;

  removeFiltersSubject: Subject<any> = new Subject();
  refreshSubject: Subject<boolean> = new Subject<boolean>();

  constructor(private store: Store<AppState>, private router: Router) {}

  ngAfterViewInit(): void {
    this.templatesSubscription = this.store
      .select(selectJobTemplatesState)
      .pipe(skip(1))
      .subscribe((state) => {
        this.jobTemplates = state.jobTemplates;
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
    this.store.dispatch(new SearchJobTemplates(searchRequestModel));
    this.refreshSubject.next(true);
  }

  clearFilters() {
    this.removeFiltersSubject.next();
  }

  clearSort() {
    !!this.sort ? (this.columns.find((_) => _.field == this.sort.by).sortOrder = 0) : undefined;
  }

  showJobTemplate(id: number) {
    this.router.navigate([absoluteRoutes.SHOW_JOB_TEMPLATE, id]);
  }

  ngOnDestroy(): void {
    !!this.templatesSubscription && this.templatesSubscription.unsubscribe();
  }
}
