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

import { ShellJobComponent } from './shell-job.component';
import { ShellDefinitionParametersModel } from '../../../../../../../models/jobDefinitionParameters.model';
import { EventEmitter } from '@angular/core';
import { JobTemplateChangeEventModel } from '../../../../../../../models/jobTemplateChangeEvent';
import { ShellTemplateParametersModel } from '../../../../../../../models/jobTemplateParameters.model';

describe('ShellComponent', () => {
  let fixture: ComponentFixture<ShellJobComponent>;
  let underTest: ShellJobComponent;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ShellJobComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ShellJobComponent);
    underTest = fixture.componentInstance;

    //set test data
    underTest.jobParameters = ShellDefinitionParametersModel.createEmpty();
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it(
    'should emit job parameters change with empty scriptLocation on job template change',
    waitForAsync(() => {
      spyOn(underTest.jobParametersChange, 'emit');
      underTest.jobTemplateChanges = new EventEmitter<JobTemplateChangeEventModel>();
      underTest.jobParameters = { ...underTest.jobParameters, scriptLocation: 'scriptLocation' };

      underTest.ngOnInit();
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        underTest.jobTemplateChanges.emit(new JobTemplateChangeEventModel('templateChange', ShellTemplateParametersModel.createEmpty()));

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(underTest.jobParametersChange.emit).toHaveBeenCalled();
          expect(underTest.jobParametersChange.emit).toHaveBeenCalledWith({ ...underTest.jobParameters, scriptLocation: undefined });
        });
      });
    }),
  );

  it('should emit updated job parameters when scriptChange() is called', () => {
    spyOn(underTest.jobParametersChange, 'emit');
    const newScript = 'newScript';
    const newJobParameters = { ...underTest.jobParameters, scriptLocation: newScript };

    underTest.scriptChange(newScript);

    expect(underTest.jobParametersChange.emit).toHaveBeenCalled();
    expect(underTest.jobParametersChange.emit).toHaveBeenCalledWith(newJobParameters);
  });
});
