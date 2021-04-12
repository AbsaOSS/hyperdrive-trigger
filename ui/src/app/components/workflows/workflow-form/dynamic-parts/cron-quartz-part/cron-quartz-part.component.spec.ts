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

import { TestBed, waitForAsync } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { CronQuartzPartComponent } from './cron-quartz-part.component';
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../../../../models/workflowEntry.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { UtilService } from '../../../../../services/util/util.service';
import {
  DayValues,
  Frequencies,
  HourAtValues,
  HourEveryValues,
  InputTypes,
} from '../../../../../constants/cronExpressionOptions.constants';
import { texts } from '../../../../../constants/texts.constants';

describe('CronQuartzPartComponent', () => {
  let underTest: CronQuartzPartComponent;
  let toastrService: ToastrService;
  let utilService: UtilService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [UtilService, CronQuartzPartComponent],
        imports: [HttpClientTestingModule, ToastrModule.forRoot()],
      }).compileComponents();
      underTest = TestBed.inject(CronQuartzPartComponent);
      toastrService = TestBed.inject(ToastrService);
      utilService = TestBed.inject(UtilService);
    }),
  );

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set default cron expression when value is undefined', () => {
      const property = 'property';

      underTest.value = undefined;
      underTest.property = property;
      underTest.valueChanges = new Subject<WorkflowEntryModel>();

      const valueChangesSpy = spyOn(underTest.valueChanges, 'next');
      const utilServiceSpy = spyOn(utilService, 'getQuartzDetail');
      underTest.ngOnInit();

      expect(underTest.value).toEqual(underTest.defaultCronExpression);
      expect(valueChangesSpy).toHaveBeenCalled();
      expect(valueChangesSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(property, underTest.defaultCronExpression));
      expect(utilServiceSpy).toHaveBeenCalled();
      expect(utilServiceSpy).toHaveBeenCalledWith(underTest.defaultCronExpression);
    });

    it('should set free text when input cron expression is invalid', () => {
      const property = 'property';
      const value = 'value';

      underTest.value = value;
      underTest.property = property;
      underTest.valueChanges = new Subject<WorkflowEntryModel>();

      underTest.ngOnInit();

      expect(underTest.value).toEqual(value);
      expect(underTest.freeText).toEqual(value);
      expect(underTest.inputType).toEqual(InputTypes.FREE_TEXT);
    });

    it('should set user friendly when input cron expression is suitable for user friendly', () => {
      const property = 'property';
      const value = '0 0 2 ? * * *';

      underTest.value = value;
      underTest.property = property;
      underTest.valueChanges = new Subject<WorkflowEntryModel>();

      underTest.ngOnInit();

      expect(underTest.day).toEqual(2);
      expect(underTest.frequency).toEqual(Frequencies.DAY);
      expect(underTest.inputType).toEqual(InputTypes.USER_FRIENDLY);
    });
  });

  describe('onInputTypeChange', () => {
    it('when is switched to free text, free text field should be set and validation should be called', () => {
      const property = 'property';
      const valuePrevious = '';
      const valueUpdated = '0 0 2 ? * * *';

      underTest.value = valueUpdated;
      underTest.freeText = valuePrevious;
      underTest.property = property;
      underTest.valueChanges = new Subject<WorkflowEntryModel>();
      underTest.validation = undefined;
      const valueChangesSpy = spyOn(underTest.valueChanges, 'next');

      underTest.onInputTypeChange(InputTypes.FREE_TEXT);

      expect(underTest.inputType).toEqual(InputTypes.FREE_TEXT);
      expect(underTest.freeText).toEqual(valueUpdated);
      expect(underTest.validation).toBeDefined();
      expect(valueChangesSpy).toHaveBeenCalled();
      expect(valueChangesSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(property, valueUpdated));
    });

    it('when is switched to user friendly and expression could not be used defualt should be used', () => {
      const property = 'property';

      underTest.value = 'wrong expression';
      underTest.property = property;
      underTest.valueChanges = new Subject<WorkflowEntryModel>();

      const valueChangesSpy = spyOn(underTest.valueChanges, 'next');
      const toastrServiceSpy = spyOn(toastrService, 'warning');

      underTest.onInputTypeChange(InputTypes.USER_FRIENDLY);

      expect(underTest.value).toEqual(underTest.defaultCronExpression);
      expect(valueChangesSpy).toHaveBeenCalled();
      expect(valueChangesSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(property, underTest.defaultCronExpression));
      expect(toastrServiceSpy).toHaveBeenCalled();
      expect(toastrServiceSpy).toHaveBeenCalledWith(texts.CRON_QUARTZ_INVALID_FOR_USER_FRIENDLY);
    });

    it('when is switched to user friendly and expression could be used all required fields should be set', () => {
      const property = 'property';
      const value = '0 0 2 ? * * *';

      underTest.value = value;
      underTest.property = property;
      underTest.valueChanges = new Subject<WorkflowEntryModel>();

      underTest.onInputTypeChange(InputTypes.USER_FRIENDLY);

      expect(underTest.day).toEqual(2);
      expect(underTest.frequency).toEqual(Frequencies.DAY);
      expect(underTest.inputType).toEqual(InputTypes.USER_FRIENDLY);
    });
  });

  describe('onFreeTextChange', () => {
    it('when free text is changed, it should dispatch value change and call validation service', () => {
      const property = 'property';
      const expression = '0 0 5 ? * * *';

      underTest.value = undefined;
      underTest.property = property;
      underTest.valueChanges = new Subject<WorkflowEntryModel>();

      const valueChangesSpy = spyOn(underTest.valueChanges, 'next');
      const utilServiceSpy = spyOn(utilService, 'getQuartzDetail');
      underTest.onFreeTextChange(expression);

      expect(underTest.value).toEqual(expression);
      expect(valueChangesSpy).toHaveBeenCalled();
      expect(valueChangesSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(property, expression));
      expect(utilServiceSpy).toHaveBeenCalled();
      expect(utilServiceSpy).toHaveBeenCalledWith(expression);
    });
  });

  describe('modelChanged', () => {
    it('when model change is called, it should dispatch value change', () => {
      const property = 'property';
      const expressionOld = '0 0 5 ? * * *';
      const expressionUpdated = '0 0 6 ? * * *';

      underTest.value = expressionOld;
      underTest.property = property;
      underTest.valueChanges = new Subject<WorkflowEntryModel>();
      underTest.validation = undefined;

      const valueChangesSpy = spyOn(underTest.valueChanges, 'next');
      underTest.modelChanged(expressionUpdated);

      expect(underTest.value).toEqual(expressionUpdated);
      expect(valueChangesSpy).toHaveBeenCalled();
      expect(valueChangesSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(property, expressionUpdated));
    });
  });

  describe('containsPrefixSuffix', () => {
    it('should return true when tested value contains prefix and suffix', () => {
      const testedValue = ['a', 'b', 'c', 'd', 'e'];
      const prefix = ['a', 'b'];
      const suffix = ['d', 'e'];

      const result = underTest.containsPrefixSuffix(testedValue, prefix, suffix);
      expect(result).toBeTruthy();
    });

    it('should return false when tested value does not contain prefix', () => {
      const testedValue = ['a', 'b', 'c', 'd', 'e'];
      const prefix = ['a', 'x'];
      const suffix = ['d', 'e'];

      const result = underTest.containsPrefixSuffix(testedValue, prefix, suffix);
      expect(result).toBeFalsy();
    });

    it('should return false when tested value does not contain suffix', () => {
      const testedValue = ['a', 'b', 'c', 'd', 'e'];
      const prefix = ['a', 'b'];
      const suffix = ['d', 'x'];

      const result = underTest.containsPrefixSuffix(testedValue, prefix, suffix);
      expect(result).toBeFalsy();
    });
  });

  describe('onDayChange', () => {
    it('when day changes should dispatch value change with updated expression', () => {
      const initialValue = 5;
      const updatedValue = 6;
      const property = 'property';
      const result = [...underTest.everyDayUserFriendly.prefix, updatedValue, ...underTest.everyDayUserFriendly.suffix].join(' ');

      underTest.valueChanges = new Subject<WorkflowEntryModel>();
      underTest.property = property;
      underTest.value = undefined;
      underTest.day = initialValue;

      const valueChangesSpy = spyOn(underTest.valueChanges, 'next');

      underTest.onDayChange(updatedValue);

      expect(underTest.day).toEqual(updatedValue);
      expect(underTest.value).toEqual(result);
      expect(valueChangesSpy).toHaveBeenCalled();
      expect(valueChangesSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(property, result));
    });
  });

  describe('onHourAtChange', () => {
    it('when hour at changes should dispatch value change with updated expression', () => {
      const initialValue = 5;
      const updatedValue = 6;
      const property = 'property';
      const result = [...underTest.everyHourUserFriendly.prefix, updatedValue, ...underTest.everyHourUserFriendly.suffix].join(' ');

      underTest.valueChanges = new Subject<WorkflowEntryModel>();
      underTest.property = property;
      underTest.value = undefined;
      underTest.hourAt = initialValue;

      const valueChangesSpy = spyOn(underTest.valueChanges, 'next');

      underTest.onHourAtChange(updatedValue);

      expect(underTest.hourAt).toEqual(updatedValue);
      expect(underTest.value).toEqual(result);
      expect(valueChangesSpy).toHaveBeenCalled();
      expect(valueChangesSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(property, result));
    });
  });

  describe('onHourEveryChange', () => {
    it('when hour every changes should dispatch value change with updated expression', () => {
      const initialValue = 5;
      const updatedValue = 6;
      const property = 'property';
      const result = [
        ...underTest.everyHourEveryUserFriendly.prefix,
        `0/${updatedValue}`,
        ...underTest.everyHourEveryUserFriendly.suffix,
      ].join(' ');

      underTest.valueChanges = new Subject<WorkflowEntryModel>();
      underTest.property = property;
      underTest.value = undefined;
      underTest.hourEvery = initialValue;

      const valueChangesSpy = spyOn(underTest.valueChanges, 'next');

      underTest.onHourEveryChange(updatedValue);

      expect(underTest.hourEvery).toEqual(updatedValue);
      expect(underTest.value).toEqual(result);
      expect(valueChangesSpy).toHaveBeenCalled();
      expect(valueChangesSpy).toHaveBeenCalledWith(WorkflowEntryModelFactory.create(property, result));
    });
  });

  describe('onFrequencyChange', () => {
    it('when frequency day is passed it should call onDayChange', () => {
      const frequency = Frequencies.DAY;
      const onDayChangeSpy = spyOn(underTest, 'onDayChange');

      underTest.onFrequencyChange(frequency);

      expect(underTest.frequency).toEqual(frequency);
      expect(onDayChangeSpy).toHaveBeenCalled();
      expect(onDayChangeSpy).toHaveBeenCalledWith(DayValues[0]);
    });

    it('when frequency hour every is passed it should call onDayChange', () => {
      const frequency = Frequencies.HOUR_EVERY;
      const onDayChangeSpy = spyOn(underTest, 'onHourEveryChange');

      underTest.onFrequencyChange(frequency);

      expect(underTest.frequency).toEqual(frequency);
      expect(onDayChangeSpy).toHaveBeenCalled();
      expect(onDayChangeSpy).toHaveBeenCalledWith(HourEveryValues[0]);
    });

    it('when frequency hour at is passed it should call onDayChange', () => {
      const frequency = Frequencies.HOUR_AT;
      const onDayChangeSpy = spyOn(underTest, 'onHourAtChange');

      underTest.onFrequencyChange(frequency);

      expect(underTest.frequency).toEqual(frequency);
      expect(onDayChangeSpy).toHaveBeenCalled();
      expect(onDayChangeSpy).toHaveBeenCalledWith(HourAtValues[0]);
    });
  });

  describe('fromQuartzUserFriendly', () => {
    it('when expression with wrong number of parts is passed should return false', () => {
      const expressionOne = '1 2 3 4 5 6 7 8';
      const expressionTwo = '1 2 3 4';

      const resultOne = underTest.fromQuartzUserFriendly(expressionOne);
      const resultTwo = underTest.fromQuartzUserFriendly(expressionTwo);

      expect(resultOne).toBeFalsy();
      expect(resultTwo).toBeFalsy();
    });

    it('when expression for every day is passed with correct day value, it should return true and set required fields', () => {
      const day = 5;
      const expression = `0 0 ${day} ? * * *`;

      const result = underTest.fromQuartzUserFriendly(expression);

      expect(result).toBeTruthy();
      expect(underTest.frequency).toEqual(Frequencies.DAY);
      expect(underTest.day).toEqual(day);
    });

    it('when expression for every day is passed with incorrect day value, it should return false', () => {
      const day = 99;
      const expression = `0 0 ${day} ? * * *`;

      const result = underTest.fromQuartzUserFriendly(expression);

      expect(result).toBeFalsy();
    });

    it('when expression for every hour at is passed with correct hour value, it should return true and set required fields', () => {
      const hour = 5;
      const expression = `0 ${hour} * ? * * *`;

      const result = underTest.fromQuartzUserFriendly(expression);

      expect(result).toBeTruthy();
      expect(underTest.frequency).toEqual(Frequencies.HOUR_AT);
      expect(underTest.hourAt).toEqual(hour);
    });

    it('when expression for every hour at is passed with incorrect hour value, it should return false', () => {
      const hour = 99;
      const expression = `0 ${hour} * ? * * *`;

      const result = underTest.fromQuartzUserFriendly(expression);

      expect(result).toBeFalsy();
    });

    it('when expression for every hour every is passed with correct minute value, it should return true and set required fields', () => {
      const minute = 5;
      const expression = `0 0/${minute} * ? * * *`;

      const result = underTest.fromQuartzUserFriendly(expression);

      expect(result).toBeTruthy();
      expect(underTest.frequency).toEqual(Frequencies.HOUR_EVERY);
      expect(underTest.hourEvery).toEqual(minute);
    });

    it('when expression for every hour every is passed with incorrect minute value, it should return false', () => {
      const minute = 99;
      const expression = `0 0/${minute} * ? * * *`;

      const result = underTest.fromQuartzUserFriendly(expression);

      expect(result).toBeFalsy();
    });
  });
});
