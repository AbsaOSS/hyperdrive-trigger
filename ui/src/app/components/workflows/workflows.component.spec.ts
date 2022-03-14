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
import { WorkflowsComponent } from './workflows.component';
import { provideMockStore } from '@ngrx/store/testing';
import { ProjectModelFactory, WorkflowIdentityModelFactory } from '../../models/project.model';
import { WorkflowModelFactory } from '../../models/workflow.model';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, Routes } from '@angular/router';

describe('WorkflowsComponent', () => {
  let fixture: ComponentFixture<WorkflowsComponent>;
  let underTest: WorkflowsComponent;
  let router: Router;

  const routes = [{ path: 'workflows/show/:id', component: {} }] as Routes;

  const initialAppState = {
    workflows: {
      loading: true,
      projects: [
        ProjectModelFactory.create('projectOne', [
          WorkflowModelFactory.create('workflowOne', undefined, undefined, undefined, undefined, undefined, undefined),
        ]),
        ProjectModelFactory.create('projectTwo', [
          WorkflowModelFactory.create('workflowTwo', undefined, undefined, undefined, undefined, undefined, undefined),
        ]),
      ],
    },
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [provideMockStore({ initialState: initialAppState })],
        declarations: [WorkflowsComponent],
        imports: [RouterTestingModule.withRoutes(routes)],
      }).compileComponents();
      router = TestBed.inject(Router);
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowsComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it(
    'should after view init set component properties',
    waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(underTest.loading).toBe(initialAppState.workflows.loading);
        expect(underTest.projects).toBeDefined();
      });
    }),
  );

  describe('isWorkflowHighlighted', () => {
    it(
      'should return true when url contains input id',
      waitForAsync(() => {
        const idMatching = 555;
        router.navigate(['workflows/show', idMatching]).then(() => {
          expect(underTest.isWorkflowHighlighted(idMatching)).toBeTruthy();
        });
      }),
    );

    it(
      'should return false when url does not contain input id',
      waitForAsync(() => {
        const idNonMatching = 5;
        router.navigate(['workflows/show', 555]).then(() => {
          expect(underTest.isWorkflowHighlighted(idNonMatching)).toBeFalse();
        });
      }),
    );
  });

  it(
    'toggleProject() should toggle a project',
    waitForAsync(() => {
      const project = 'project';
      const projectOther = 'projectOther';

      expect(underTest.openedProjects.size).toEqual(0);

      underTest.toggleProject(project);
      expect(underTest.openedProjects.size).toEqual(1);
      expect(underTest.openedProjects).toContain(project);

      underTest.toggleProject(projectOther);
      expect(underTest.openedProjects.size).toEqual(2);
      expect(underTest.openedProjects).toContain(project);
      expect(underTest.openedProjects).toContain(projectOther);

      underTest.toggleProject(project);
      expect(underTest.openedProjects.size).toEqual(1);
      expect(underTest.openedProjects).toContain(projectOther);

      underTest.toggleProject(projectOther);
      expect(underTest.openedProjects.size).toEqual(0);
    }),
  );

  describe('isProjectClosed', () => {
    it(
      'should return true if project is not in opened projects no workflow is highlighted',
      waitForAsync(() => {
        const id = 555;
        const otherId = 5;
        router.navigate(['workflows/show', id]).then(() => {
          expect(underTest.openedProjects.size).toEqual(0);
          expect(underTest.isWorkflowHighlighted(otherId)).toBeFalse();

          const result = underTest.isProjectClosed('project', [WorkflowIdentityModelFactory.create(otherId, 'name')]);

          expect(result).toBeTruthy();
        });
      }),
    );

    it(
      'should return false if project is in opened projects',
      waitForAsync(() => {
        const id = 555;
        const otherId = 5;
        const projectName = 'project';
        underTest.openedProjects.add(projectName);

        router.navigate(['workflows/show', id]).then(() => {
          expect(underTest.openedProjects.size).toEqual(1);
          expect(underTest.openedProjects).toContain(projectName);
          expect(underTest.isWorkflowHighlighted(otherId)).toBeFalse();

          const result = underTest.isProjectClosed(projectName, [WorkflowIdentityModelFactory.create(otherId, 'name')]);

          expect(result).toBeFalse();
        });
      }),
    );

    it(
      'should return false if project workflow is highlighted',
      waitForAsync(() => {
        const id = 555;
        router.navigate(['workflows/show', id]).then(() => {
          expect(underTest.openedProjects.size).toEqual(0);
          expect(underTest.isWorkflowHighlighted(id)).toBeTruthy();

          const result = underTest.isProjectClosed('project', [WorkflowIdentityModelFactory.create(id, 'name')]);

          expect(underTest.openedProjects.size).toEqual(1);
          expect(result).toBeFalse();
        });
      }),
    );
  });
});
