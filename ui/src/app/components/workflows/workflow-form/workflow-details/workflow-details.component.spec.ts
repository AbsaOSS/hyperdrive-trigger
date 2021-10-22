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

import { WorkflowDetailsComponent } from './workflow-details.component';
import { WorkflowJoinedModelFactory } from '../../../../models/workflowJoined.model';

describe('WorkflowDetailsComponent', () => {
  let fixture: ComponentFixture<WorkflowDetailsComponent>;
  let underTest: WorkflowDetailsComponent;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [WorkflowDetailsComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowDetailsComponent);
    underTest = fixture.componentInstance;

    //set test data
    underTest.details = WorkflowJoinedModelFactory.createEmpty();
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it('should emit updated details when nameChange() is called', () => {
    spyOn(underTest.detailsChange, 'emit');
    const newName = 'newName';
    const newSensorProperties = { ...underTest.details, name: newName };

    underTest.nameChange(newName);

    expect(underTest.detailsChange.emit).toHaveBeenCalled();
    expect(underTest.detailsChange.emit).toHaveBeenCalledWith(newSensorProperties);
  });

  it('should emit updated details when projectChange() is called', () => {
    spyOn(underTest.detailsChange, 'emit');
    const newProject = 'newProject';
    const newSensorProperties = { ...underTest.details, project: newProject };

    underTest.projectChange(newProject);

    expect(underTest.detailsChange.emit).toHaveBeenCalled();
    expect(underTest.detailsChange.emit).toHaveBeenCalledWith(newSensorProperties);
  });

  it('should emit updated details when isActiveChange() is called', () => {
    spyOn(underTest.detailsChange, 'emit');
    const newIsActive = underTest.details.isActive;
    const newSensorProperties = { ...underTest.details, isActive: newIsActive };

    underTest.isActiveChange(newIsActive);

    expect(underTest.detailsChange.emit).toHaveBeenCalled();
    expect(underTest.detailsChange.emit).toHaveBeenCalledWith(newSensorProperties);
  });
});
