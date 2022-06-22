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
import { hyperdriveTypesFields } from '../../../../../../../constants/hyperdriveTypes.constants';
import { HyperdriveTemplateParametersModel } from '../../../../../../../models/jobTemplateParameters.model';
import { JobTemplateChangeEventModel } from '../../../../../../../models/jobTemplateChangeEvent';
import { EventEmitter } from '@angular/core';
import { KeyValueModel, KeyValueModelFactory } from '../../../../../../../models/keyValue.model';

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
      underTest.jobTemplateChanges = new EventEmitter<JobTemplateChangeEventModel>();
      underTest.jobParameters = { ...underTest.jobParameters, jobJar: 'jobJar', mainClass: 'mainClass' };

      underTest.ngOnInit();
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        underTest.jobTemplateChanges.emit(
          new JobTemplateChangeEventModel('templateChange', HyperdriveTemplateParametersModel.createEmpty()),
        );

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(underTest.jobParametersChange.emit).toHaveBeenCalled();
          expect(underTest.jobParametersChange.emit).toHaveBeenCalledWith({
            ...underTest.jobParameters,
            ...[],
            jobJar: undefined,
            mainClass: undefined,
          });
        });
      });
    }),
  );

  it('should return app argument value starting with passed prefix when getHyperdriveFieldValue() is called', () => {
    const appArgumentPrefix = 'field.prefix=';
    const appArgumentValue = 'value';
    const appArguments = ['random.key1=random.value1', 'random.key2=random.value2', appArgumentPrefix + appArgumentValue];

    underTest.jobParameters = { ...underTest.jobParameters, appArguments: appArguments };

    const result = underTest.getHyperdriveFieldValue(appArgumentPrefix);
    expect(result).toEqual(appArgumentValue);
  });

  it('should return undefined if app argument with passed prefix does not exist when getHyperdriveFieldValue() is called', () => {
    const appArgumentPrefix = 'field.prefix=';
    const appArguments = ['random.key1=random.value1', 'random.key2=random.value2'];

    underTest.jobParameters = { ...underTest.jobParameters, appArguments: appArguments };

    const result = underTest.getHyperdriveFieldValue(appArgumentPrefix);
    expect(result).toEqual(undefined);
  });

  it('should return hyperdriveType when getHyperdriveType() is called', () => {
    const hyperdriveTypeFields = hyperdriveTypesFields[0];
    underTest['hyperdriveType'] = hyperdriveTypeFields.hyperdriveType;

    const result = underTest.getHyperdriveType();
    expect(result).toEqual(hyperdriveTypeFields.hyperdriveType);
  });

  it('should emit updated job parameters with updated app argument starting with passed prefix when hyperdriveFieldChange() is called', () => {
    spyOn(underTest.jobParametersChange, 'emit');
    const appArgumentPrefix = 'field.prefix=';
    const appArgumentValue = 'value';
    const newAppArgumentValue = 'newValue';
    const appArguments = ['random.key1=random.value1', 'random.key2=random.value2', appArgumentPrefix + appArgumentValue];
    const updatedAppArguments = {
      ...underTest.jobParameters,
      appArguments: ['random.key1=random.value1', 'random.key2=random.value2', appArgumentPrefix + newAppArgumentValue],
    };

    underTest.jobParameters = { ...underTest.jobParameters, appArguments: appArguments };

    underTest.hyperdriveFieldChange(newAppArgumentValue, appArgumentPrefix);

    expect(underTest.jobParametersChange.emit).toHaveBeenCalled();
    expect(underTest.jobParametersChange.emit).toHaveBeenCalledWith(updatedAppArguments);
  });

  it('should emit updated job parameters with new app argument starting with passed prefix and value when hyperdriveFieldChange() is called', () => {
    spyOn(underTest.jobParametersChange, 'emit');
    const newAppArgumentPrefix = 'field.prefix=';
    const newAppArgumentValue = 'newValue';
    const appArguments = ['random.key1=random.value1', 'random.key2=random.value2'];
    const updatedAppArguments = {
      ...underTest.jobParameters,
      appArguments: ['random.key1=random.value1', 'random.key2=random.value2', newAppArgumentPrefix + newAppArgumentValue],
    };

    underTest.jobParameters = { ...underTest.jobParameters, appArguments: appArguments };

    underTest.hyperdriveFieldChange(newAppArgumentValue, newAppArgumentPrefix);

    expect(underTest.jobParametersChange.emit).toHaveBeenCalled();
    expect(underTest.jobParametersChange.emit).toHaveBeenCalledWith(updatedAppArguments);
  });

  it('should emit empty job parameters and update hyperdriveType field when hyperdriveTypeChange() is called', () => {
    spyOn(underTest.jobParametersChange, 'emit');
    const hyperdriveTypePrevious = hyperdriveTypesFields[0].hyperdriveType;
    const hyperdriveTypeChanged = hyperdriveTypesFields[1].hyperdriveType;
    underTest['hyperdriveType'] = hyperdriveTypePrevious;

    const newJobParameters = HyperdriveDefinitionParametersModel.createEmpty();

    underTest.hyperdriveTypeChange(hyperdriveTypeChanged);

    expect(underTest['hyperdriveType']).toEqual(hyperdriveTypeChanged);
    expect(underTest.jobParametersChange.emit).toHaveBeenCalled();
    expect(underTest.jobParametersChange.emit).toHaveBeenCalledWith(newJobParameters);
  });

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

  it('should return not hyperdrive app arguments when getAppArguments() is called', () => {
    const hyperdriveTypeFields = hyperdriveTypesFields[0];
    const notHyperdriveAppArguments = ['random.key1=random.value1', 'random.key2=random.value2'];
    underTest['hyperdriveType'] = hyperdriveTypeFields.hyperdriveType;
    underTest.jobParameters = {
      ...underTest.jobParameters,
      appArguments: [...hyperdriveTypeFields.fields.map((field) => field + 'value'), ...notHyperdriveAppArguments],
    };

    const result = underTest.getAppArguments();
    expect(result.length).toEqual(notHyperdriveAppArguments.length);
    expect(result).toEqual(notHyperdriveAppArguments);
  });

  it('should return empty array if there are no hypedrive app arguments when getAppArguments() is called', () => {
    const hyperdriveTypeFields = hyperdriveTypesFields[0];
    const notHyperdriveAppArguments = [];
    underTest['hyperdriveType'] = hyperdriveTypeFields.hyperdriveType;
    underTest.jobParameters = {
      ...underTest.jobParameters,
      appArguments: [...hyperdriveTypeFields.fields.map((field) => field + 'value'), ...notHyperdriveAppArguments],
    };

    const result = underTest.getAppArguments();
    expect(result.length).toEqual(notHyperdriveAppArguments.length);
    expect(result).toEqual(notHyperdriveAppArguments);
  });

  it('should emit updated job parameters when appArgumentsChange() is called', () => {
    spyOn(underTest.jobParametersChange, 'emit');
    const hyperdriveTypeFields = hyperdriveTypesFields[0];
    const hyperdriveAppArguments = hyperdriveTypeFields.fields.map((field) => field + 'value');
    const notHyperdriveAppArguments = ['random.key1=random.value1', 'random.key2=random.value2'];
    const newAppArguments = ['newAppArgument1', 'newAppArgument2', 'newAppArgument3'];

    underTest['hyperdriveType'] = hyperdriveTypeFields.hyperdriveType;
    underTest.jobParameters = { ...underTest.jobParameters, appArguments: [...hyperdriveAppArguments, ...notHyperdriveAppArguments] };

    const expectedAppArguments = [...newAppArguments, ...hyperdriveAppArguments];
    const newJobParameters = { ...underTest.jobParameters, appArguments: expectedAppArguments };

    underTest.appArgumentsChange(newAppArguments);

    expect(underTest.jobParametersChange.emit).toHaveBeenCalled();
    expect(underTest.jobParametersChange.emit).toHaveBeenCalledWith(newJobParameters);
  });

  it('should emit updated job parameters when additionalSparkConfigChange() is called', () => {
    spyOn(underTest.jobParametersChange, 'emit');
    const newAdditionalSparkConfigs = [
      KeyValueModelFactory.create('newAdditionalSparkConfigKey1', 'newAdditionalSparkConfigValue1'),
      KeyValueModelFactory.create('newAdditionalSparkConfigKey2', 'newAdditionalSparkConfigValue2'),
      KeyValueModelFactory.create('newAdditionalSparkConfigKey3', 'newAdditionalSparkConfigValue3'),
    ];
    const newJobParameters = { ...underTest.jobParameters, additionalSparkConfig: newAdditionalSparkConfigs };

    underTest.additionalSparkConfigChange(newAdditionalSparkConfigs);

    expect(underTest.jobParametersChange.emit).toHaveBeenCalled();
    expect(underTest.jobParametersChange.emit).toHaveBeenCalledWith(newJobParameters);
  });
});
