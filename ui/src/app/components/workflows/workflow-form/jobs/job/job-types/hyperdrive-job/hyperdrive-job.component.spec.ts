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

import { HyperdriveJobComponent } from './hyperdrive-job.component';
import { HyperdriveDefinitionParametersModel } from '../../../../../../../models/jobDefinitionParameters.model';
import { EventEmitter } from '@angular/core';

describe('HyperdriveJobComponent', () => {
  let fixture: ComponentFixture<HyperdriveJobComponent>;
  let underTest: HyperdriveJobComponent;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [HyperdriveJobComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(HyperdriveJobComponent);
    underTest = fixture.componentInstance;
    underTest.jobParameters = HyperdriveDefinitionParametersModel.createEmpty();
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it(
    'should emit job parameters change with empty jobJar and mainClass on job template change',
    waitForAsync(() => {
      spyOn(underTest.jobParametersChange, 'emit');
      underTest.jobTemplateChanges = new EventEmitter<string>();
      underTest.jobParameters = { ...underTest.jobParameters, jobJar: 'jobJar', mainClass: 'mainClass' };

      underTest.ngOnInit();
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        underTest.jobTemplateChanges.emit('templateChange');

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(underTest.jobParametersChange.emit).toHaveBeenCalled();
          expect(underTest.jobParametersChange.emit).toHaveBeenCalledWith({
            ...underTest.jobParameters,
            jobJar: undefined,
            mainClass: undefined,
          });
        });
      });
    }),
  );

  it('should emit updated job parameters when jobJarChange() is called', () => {
    spyOn(underTest.jobParametersChange, 'emit');
    const newJobJar = 'newJobJar';
    const newJobParameters = { ...underTest.jobParameters, jobJar: newJobJar };

    underTest.jobJarChange(newJobJar);

    expect(underTest.jobParametersChange.emit).toHaveBeenCalled();
    expect(underTest.jobParametersChange.emit).toHaveBeenCalledWith(newJobParameters);
  });

  it('should emit updated job parameters when mainClassChange() is called', () => {
    spyOn(underTest.jobParametersChange, 'emit');
    const newMainClass = 'newMainClass';
    const newJobParameters = { ...underTest.jobParameters, mainClass: newMainClass };

    underTest.mainClassChange(newMainClass);

    expect(underTest.jobParametersChange.emit).toHaveBeenCalled();
    expect(underTest.jobParametersChange.emit).toHaveBeenCalledWith(newJobParameters);
  });

  it('should emit updated job parameters when additionalJarsChange() is called', () => {
    spyOn(underTest.jobParametersChange, 'emit');
    const newAdditionalJars = ['newAdditionalJar1', 'newAdditionalJar2', 'newAdditionalJar3'];
    const newJobParameters = { ...underTest.jobParameters, additionalJars: newAdditionalJars };

    underTest.additionalJarsChange(newAdditionalJars);

    expect(underTest.jobParametersChange.emit).toHaveBeenCalled();
    expect(underTest.jobParametersChange.emit).toHaveBeenCalledWith(newJobParameters);
  });

  it('should emit updated job parameters when additionalFilesChange() is called', () => {
    spyOn(underTest.jobParametersChange, 'emit');
    const newAdditionalFiles = ['newAdditionalFile1', 'newAdditionalFile2', 'newAdditionalFile3'];
    const newJobParameters = { ...underTest.jobParameters, additionalFiles: newAdditionalFiles };

    underTest.additionalFilesChange(newAdditionalFiles);

    expect(underTest.jobParametersChange.emit).toHaveBeenCalled();
    expect(underTest.jobParametersChange.emit).toHaveBeenCalledWith(newJobParameters);
  });

  it('should emit updated job parameters when appArgumentsChange() is called', () => {
    spyOn(underTest.jobParametersChange, 'emit');
    const newAppArguments = ['newAppArgument1', 'newAppArgument2', 'newAppArgument3'];
    const newJobParameters = { ...underTest.jobParameters, appArguments: newAppArguments };

    underTest.appArgumentsChange(newAppArguments);

    expect(underTest.jobParametersChange.emit).toHaveBeenCalled();
    expect(underTest.jobParametersChange.emit).toHaveBeenCalledWith(newJobParameters);
  });

  it('should emit updated job parameters when additionalSparkConfigChange() is called', () => {
    spyOn(underTest.jobParametersChange, 'emit');
    const newAdditionalSparkConfigs = new Map<string, string>([
      ['newAdditionalSparkConfigKey1', 'newAdditionalSparkConfigValue1'],
      ['newAdditionalSparkConfigKey2', 'newAdditionalSparkConfigValue2'],
      ['newAdditionalSparkConfigKey3', 'newAdditionalSparkConfigValue3'],
    ]);
    const newJobParameters = { ...underTest.jobParameters, additionalSparkConfig: newAdditionalSparkConfigs };

    underTest.additionalSparkConfigChange(newAdditionalSparkConfigs);

    expect(underTest.jobParametersChange.emit).toHaveBeenCalled();
    expect(underTest.jobParametersChange.emit).toHaveBeenCalledWith(newJobParameters);
  });
});
