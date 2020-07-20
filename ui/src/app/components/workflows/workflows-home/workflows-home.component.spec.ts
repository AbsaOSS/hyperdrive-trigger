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

import { WorkflowsHomeComponent } from './workflows-home.component';
import { provideMockStore } from '@ngrx/store/testing';
import { ProjectModel, ProjectModelFactory } from '../../../models/project.model';
import { WorkflowModel, WorkflowModelFactory } from '../../../models/workflow.model';
import { SortAttributesModel } from '../../../models/search/sortAttributes.model';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog/confirmation-dialog.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../../stores/app.reducers';
import { Subject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { absoluteRoutes } from '../../../constants/routes.constants';
import { ClrDatagridStateInterface } from '@clr/angular';
import {
  DeleteWorkflow,
  RunWorkflow,
  SwitchWorkflowActiveState,
  SetWorkflowsSort,
  SetWorkflowsFilters,
} from '../../../stores/workflows/workflows.actions';

describe('WorkflowsHomeComponent', () => {
  let fixture: ComponentFixture<WorkflowsHomeComponent>;
  let underTest: WorkflowsHomeComponent;
  let confirmationDialogService: ConfirmationDialogService;
  let store: Store<AppState>;
  let router: Router;

  const initialAppState = {
    workflows: {
      projects: [
        ProjectModelFactory.create('projectOne', [
          WorkflowModelFactory.create('workflowOne', undefined, undefined, undefined, undefined, undefined),
        ]),
        ProjectModelFactory.create('projectTwo', [
          WorkflowModelFactory.create('workflowTwo', undefined, undefined, undefined, undefined, undefined),
        ]),
      ],
    },
    workflowsSort: undefined,
    workflowsFilters: undefined,
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [ConfirmationDialogService, provideMockStore({ initialState: initialAppState })],
      declarations: [WorkflowsHomeComponent],
      imports: [RouterTestingModule.withRoutes([])],
    }).compileComponents();
    confirmationDialogService = TestBed.inject(ConfirmationDialogService);
    store = TestBed.inject(Store);
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowsHomeComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it('should after view init set component properties', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.workflows).toEqual([].concat(...initialAppState.workflows.projects.map((project) => project.workflows)));
      expect(underTest.sort).toEqual(initialAppState.workflowsSort);
      expect(underTest.filters).toBeUndefined();
    });
  }));

  it('deleteWorkflow() should dispatch delete workflow action with id when dialog is confirmed', async(() => {
    const id = 1;
    const subject = new Subject<boolean>();
    const storeSpy = spyOn(store, 'dispatch');

    spyOn(confirmationDialogService, 'confirm').and.returnValue(subject.asObservable());

    underTest.deleteWorkflow(id);
    subject.next(true);

    fixture.detectChanges();
    expect(underTest.ignoreRefresh).toBeTrue();
    fixture.whenStable().then(() => {
      expect(storeSpy).toHaveBeenCalled();
      expect(storeSpy).toHaveBeenCalledWith(new DeleteWorkflow(id));
    });
  }));

  it('deleteWorkflow() should not dispatch delete workflow action when dialog is not confirmed', async(() => {
    const id = 1;
    const subject = new Subject<boolean>();
    const storeSpy = spyOn(store, 'dispatch');

    spyOn(confirmationDialogService, 'confirm').and.returnValue(subject.asObservable());

    underTest.deleteWorkflow(id);
    subject.next(false);

    fixture.detectChanges();
    expect(underTest.ignoreRefresh).toBeTrue();
    fixture.whenStable().then(() => {
      expect(storeSpy).toHaveBeenCalledTimes(0);
    });
  }));

  it('switchWorkflowActiveState() should dispatch switch workflow active state with id and old value when dialog is confirmed', async(() => {
    const id = 1;
    const currentActiveState = true;
    const subject = new Subject<boolean>();
    const storeSpy = spyOn(store, 'dispatch');

    spyOn(confirmationDialogService, 'confirm').and.returnValue(subject.asObservable());

    underTest.switchWorkflowActiveState(id, currentActiveState);
    subject.next(true);

    fixture.detectChanges();
    expect(underTest.ignoreRefresh).toBeTrue();
    fixture.whenStable().then(() => {
      expect(storeSpy).toHaveBeenCalled();
      expect(storeSpy).toHaveBeenCalledWith(new SwitchWorkflowActiveState({ id: id, currentActiveState: currentActiveState }));
    });
  }));

  it('switchWorkflowActiveState() should not dispatch switch workflow active state when dialog is not confirmed', async(() => {
    const id = 1;
    const currentActiveState = false;
    const subject = new Subject<boolean>();
    const storeSpy = spyOn(store, 'dispatch');

    spyOn(confirmationDialogService, 'confirm').and.returnValue(subject.asObservable());

    underTest.switchWorkflowActiveState(id, currentActiveState);
    subject.next(false);

    fixture.detectChanges();
    expect(underTest.ignoreRefresh).toBeFalse();
    fixture.whenStable().then(() => {
      expect(storeSpy).toHaveBeenCalledTimes(0);
    });
  }));

  it('runWorkflow() should dispatch switch run workflow', async(() => {
    const id = 42;
    const subject = new Subject<boolean>();
    const storeSpy = spyOn(store, 'dispatch');

    spyOn(confirmationDialogService, 'confirm').and.returnValue(subject.asObservable());

    underTest.runWorkflow(id);
    underTest.ngOnInit();
    subject.next(true);

    fixture.detectChanges();
    expect(underTest.ignoreRefresh).toBeTrue();
    fixture.whenStable().then(() => {
      expect(storeSpy).toHaveBeenCalled();
      expect(storeSpy).toHaveBeenCalledWith(new RunWorkflow(id));
    });
  }));

  it('runWorkflow() should not dispatch run workflow when dialog is not confirmed', async(() => {
    const id = 42;
    const subject = new Subject<boolean>();
    const storeSpy = spyOn(store, 'dispatch');

    spyOn(confirmationDialogService, 'confirm').and.returnValue(subject.asObservable());

    underTest.runWorkflow(id);
    subject.next(false);

    fixture.detectChanges();
    expect(underTest.ignoreRefresh).toBeTrue();
    fixture.whenStable().then(() => {
      expect(storeSpy).toHaveBeenCalledTimes(0);
    });
  }));

  it('showWorkflow() should navigate to show workflow page', async(() => {
    const id = 42;
    const routerSpy = spyOn(router, 'navigate');

    underTest.showWorkflow(id);

    expect(routerSpy).toHaveBeenCalledTimes(1);
    expect(routerSpy).toHaveBeenCalledWith([absoluteRoutes.SHOW_WORKFLOW, id]);
  }));

  describe('onClarityDgRefresh', () => {
    it('should dispatch SetWorkflowsSort when ignoreRefresh is false', async(() => {
      underTest.ignoreRefresh = false;

      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');
      const state: ClrDatagridStateInterface = {};

      underTest.onClarityDgRefresh(state);
      subject.next(true);

      fixture.detectChanges();
      expect(underTest.ignoreRefresh).toBeFalse();
      expect(underTest.sort).toBeUndefined();
      expect(underTest.filters).toBeUndefined();

      fixture.whenStable().then(() => {
        expect(storeSpy).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalledWith(new SetWorkflowsSort(underTest.sort));
      });
    }));

    it('onClarityDgRefresh() should not dispatch SetWorkflowsSort and SetWorkflowsFilters when ignoreRefresh is true', async(() => {
      underTest.ignoreRefresh = true;

      const subject = new Subject<boolean>();
      const storeSpy = spyOn(store, 'dispatch');
      const state: ClrDatagridStateInterface = {};

      underTest.onClarityDgRefresh(state);
      subject.next(true);

      fixture.detectChanges();
      expect(underTest.ignoreRefresh).toBeTrue();
      expect(storeSpy).not.toHaveBeenCalled();
    }));
  });
});
