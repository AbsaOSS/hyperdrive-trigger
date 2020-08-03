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

import { Component, Input, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../../../../models/workflowEntry.model';
import {
  DayValues,
  Frequencies,
  HourAtValues,
  HourEveryValues,
  InputTypes,
} from '../../../../../constants/cronExpressionOptions.constants';
import { UtilService } from '../../../../../services/util/util.service';
import { QuartzExpressionDetailModel } from '../../../../../models/quartzExpressionDetail.model';
import { ToastrService } from 'ngx-toastr';
import { texts } from '../../../../../constants/texts.constants';
import { ControlContainer, NgForm } from '@angular/forms';
import { UuidUtil } from '../../../../../utils/uuid/uuid.util';

@Component({
  selector: 'app-cron-quartz-part',
  templateUrl: './cron-quartz-part.component.html',
  styleUrls: ['./cron-quartz-part.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
})
export class CronQuartzPartComponent implements OnInit {
  @Input() isShow: boolean;
  @Input() name: string;
  @Input() value: string;
  @Input() property: string;
  @Input() valueChanges: Subject<WorkflowEntryModel>;

  uiid = UuidUtil.createUUID();
  defaultCronExpression = '0 0/25 * ? * * *';
  everyDayUserFriendly: UserFriendlyConstruction = { prefix: ['0', '0'], suffix: ['?', '*', '*', '*'], position: 2 };
  everyHourUserFriendly: UserFriendlyConstruction = { prefix: ['0'], suffix: ['*', '?', '*', '*', '*'], position: 1 };
  everyHourEveryUserFriendly: UserFriendlyConstruction = { prefix: ['0'], suffix: ['*', '?', '*', '*', '*'], position: 1 };

  inputType;
  freeText: string;
  validation: Observable<QuartzExpressionDetailModel>;

  frequency: string;
  day: number;
  hourAt: number;
  hourEvery: number;

  InputTypes = InputTypes;
  Frequencies = Frequencies;
  DayValues = DayValues;
  HourAtValues = HourAtValues;
  HourEveryValues = HourEveryValues;
  texts = texts;

  constructor(private toastrService: ToastrService, private utilService: UtilService) {
    // do nothing
  }

  ngOnInit(): void {
    if (!this.value) {
      this.inputType = this.InputTypes.USER_FRIENDLY;
      this.modelChanged(this.defaultCronExpression);
      this.fromQuartzUserFriendly(this.defaultCronExpression);
    } else {
      if (this.fromQuartzUserFriendly(this.value)) {
        this.inputType = this.InputTypes.USER_FRIENDLY;
      } else {
        this.freeText = this.value;
        this.inputType = this.InputTypes.FREE_TEXT;
      }
    }
    this.validation = this.utilService.getQuartzDetail(this.value);
  }

  onInputTypeChange(value) {
    this.inputType = value;
    if (value == InputTypes.USER_FRIENDLY) {
      if (!this.fromQuartzUserFriendly(this.value)) {
        this.toastrService.warning(texts.CRON_QUARTZ_INVALID_FOR_USER_FRIENDLY);
        this.modelChanged(this.defaultCronExpression);
        this.fromQuartzUserFriendly(this.defaultCronExpression);
      }
    } else {
      this.onFreeTextChange(this.value);
    }
  }

  onFreeTextChange(value) {
    this.modelChanged(value);
    this.freeText = value;
    this.validation = this.utilService.getQuartzDetail(value);
  }

  onFrequencyChange(value) {
    this.frequency = value;
    switch (value) {
      case Frequencies.DAY:
        this.onDayChange(DayValues[0]);
        break;
      case Frequencies.HOUR_EVERY:
        this.onHourEveryChange(HourEveryValues[0]);
        break;
      case Frequencies.HOUR_AT:
        this.onHourAtChange(HourAtValues[0]);
        break;
    }
  }

  onDayChange(value) {
    this.day = value;
    const result = [...this.everyDayUserFriendly.prefix, this.day, ...this.everyDayUserFriendly.suffix];
    this.modelChanged(result.join(' '));
  }

  onHourAtChange(value) {
    this.hourAt = value;
    const result = [...this.everyHourUserFriendly.prefix, this.hourAt, ...this.everyHourUserFriendly.suffix];
    this.modelChanged(result.join(' '));
  }

  onHourEveryChange(value) {
    this.hourEvery = value;
    const cronMinute = `0/${this.hourEvery}`;
    const result = [...this.everyHourEveryUserFriendly.prefix, cronMinute, ...this.everyHourEveryUserFriendly.suffix];

    this.modelChanged(result.join(' '));
  }

  containsPrefixSuffix(value: string[], prefix: string[], suffix: string[]): boolean {
    return (
      value.slice(0, prefix.length).join(' ') == prefix.join(' ') &&
      value.slice(prefix.length + 1, value.length).join(' ') == suffix.join(' ')
    );
  }

  fromQuartzUserFriendly(value: string): boolean {
    const splittedCron: string[] = value.replace(/\s+/g, ' ').split(' ');

    if (splittedCron.length == 7) {
      if (
        this.containsPrefixSuffix(splittedCron, this.everyHourEveryUserFriendly.prefix, this.everyHourEveryUserFriendly.suffix) &&
        isNaN(+splittedCron[this.everyHourEveryUserFriendly.position])
      ) {
        const usedValue = splittedCron[this.everyHourEveryUserFriendly.position];
        if (usedValue.startsWith('0/')) {
          const usedValueWithoutPrefix = usedValue.replace('0/', '');
          if (!isNaN(+usedValueWithoutPrefix) && Object.values(this.HourEveryValues).includes(+usedValueWithoutPrefix)) {
            this.hourEvery = +usedValueWithoutPrefix;
            this.frequency = Frequencies.HOUR_EVERY;
            return true;
          }
        }
      } else if (
        this.containsPrefixSuffix(splittedCron, this.everyHourUserFriendly.prefix, this.everyHourUserFriendly.suffix) &&
        !isNaN(+splittedCron[this.everyHourUserFriendly.position])
      ) {
        const usedValue: number = +splittedCron[this.everyHourUserFriendly.position];
        if (Object.values(this.HourAtValues).includes(usedValue)) {
          this.hourAt = usedValue;
          this.frequency = Frequencies.HOUR_AT;
          return true;
        }
      } else if (
        this.containsPrefixSuffix(splittedCron, this.everyDayUserFriendly.prefix, this.everyDayUserFriendly.suffix) &&
        !isNaN(+splittedCron[this.everyDayUserFriendly.position])
      ) {
        const usedValue: number = +splittedCron[this.everyDayUserFriendly.position];
        if (Object.values(this.DayValues).includes(usedValue)) {
          this.day = usedValue;
          this.frequency = Frequencies.DAY;
          return true;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  modelChanged(value: string): void {
    this.value = value.trim();
    this.valueChanges.next(WorkflowEntryModelFactory.create(this.property, this.value));
  }
}

interface UserFriendlyConstruction {
  prefix: string[];
  suffix: string[];
  position: number;
}
