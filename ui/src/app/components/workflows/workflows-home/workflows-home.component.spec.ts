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
import { ProjectModel } from '../../../models/project.model';
import { WorkflowModel } from '../../../models/workflow.model';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog/confirmation-dialog.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../../stores/app.reducers';
import { Subject } from 'rxjs';
import { DeleteWorkflow, RunWorkflow, SwitchWorkflowActiveState } from '../../../stores/workflows/workflows.actions';

describe('WorkflowsHomeComponent', () => {
  let fixture: ComponentFixture<WorkflowsHomeComponent>;
  let underTest: WorkflowsHomeComponent;
  let confirmationDialogService: ConfirmationDialogService;
  let store: Store<AppState>;

  const initialAppState = {
    workflows: {
      projects: [
        new ProjectModel('projectOne', [new WorkflowModel('workflowOne', undefined, undefined, undefined, undefined, undefined)]),
        new ProjectModel('projectTwo', [new WorkflowModel('workflowTwo', undefined, undefined, undefined, undefined, undefined)]),
      ],
    },
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [ConfirmationDialogService, provideMockStore({ initialState: initialAppState })],
      declarations: [WorkflowsHomeComponent],
    }).compileComponents();
    confirmationDialogService = TestBed.inject(ConfirmationDialogService);
    store = TestBed.inject(Store);
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
    fixture.whenStable().then(() => {
      expect(storeSpy).toHaveBeenCalledTimes(0);
    });
  }));
});
