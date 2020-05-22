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
import { Subject } from 'rxjs';
import cronstrue from 'cronstrue';
import { isValidCron } from 'cron-validator';
import { Subscription } from 'rxjs';
import { WorkflowEntryModel } from '../../../../../models/workflowEntry.model';
import { sensorFrequency } from '../../../../../constants/cronExpressionOptions.constants';
import { EveryMinute } from '../../../../../constants/cronExpressionOptions.constants';
import { EveryHour } from '../../../../../constants/cronExpressionOptions.constants';
import { ConfirmationDialogService } from '../../../../../services/confirmation-dialog/confirmation-dialog.service';
import { ConfirmationDialogTypes } from '../../../../../constants/confirmationDialogTypes.constants';
import { texts } from '../../../../../constants/texts.constants';

@Component({
  selector: 'app-cron-quartz-part',
  templateUrl: './cron-quartz-part.component.html',
  styleUrls: ['./cron-quartz-part.component.scss'],
})
export class CronQuartzPartComponent implements OnInit {
  @Input() isShow: boolean;
  @Input() name: string;
  @Input() value: string;
  @Input() property: string;
  @Input() valueChanges: Subject<WorkflowEntryModel>;

  base: number;
  dayValue: number;
  minuteValue: number;
  hourValue: number;
  validateCronDialogServiceSubscription: Subscription = null;
  readableCronExpression: string;
  validCron: boolean;

  hourValues = [
    EveryHour.Zero,
    EveryHour.One,
    EveryHour.Two,
    EveryHour.Three,
    EveryHour.Four,
    EveryHour.Five,
    EveryHour.Six,
    EveryHour.Seven,
    EveryHour.Eight,
    EveryHour.Nine,
    EveryHour.Ten,
    EveryHour.Eleven,
    EveryHour.Twelve,
    EveryHour.Thirteen,
    EveryHour.Fourteen,
    EveryHour.Fifteen,
    EveryHour.Sixtenn,
    EveryHour.Seventeen,
    EveryHour.Eighteen,
    EveryHour.Nineteen,
    EveryHour.Twenty,
    EveryHour.TwentyOne,
    EveryHour.TwentyTwo,
    EveryHour.TwentyThree,
  ];

  minuteValues = [
    EveryHour.Zero,
    EveryHour.Five,
    EveryHour.Ten,
    EveryHour.Fifteen,
    EveryHour.Twenty,
    EveryMinute.TwentyFive,
    EveryMinute.Thirty,
    EveryMinute.ThirtyFive,
    EveryMinute.Forty,
    EveryMinute.FortyFive,
    EveryMinute.Fifty,
    EveryMinute.FiftyFive,
  ];

  minutesValues = [EveryHour.Five, EveryHour.Ten, EveryHour.Fifteen, EveryHour.Twenty, EveryMinute.TwentyFive, EveryMinute.Thirty];

  frequencies = sensorFrequency.FREQUENCIES;
  invalidCronExpression = texts.VALIDATE_CRON_CONFIRMATION_MESSAGE;
  cron: string[] = [];

  constructor(private confirmationDialogService: ConfirmationDialogService) {
    // do nothing
  }

  ngOnInit(): void {
    // this.value = 'error';
    // this.value = '0 0/20 * ? * * *'; every minute
    // this.value = '0 20 * ? * * *'; every hour
    // this.value = '0 0 20 ? * * *'; every day at

    if (!this.validateCron(this.value)) {
      this.validationMessage(this.value);
      this.cron = ['0', '0', '0', '?', '*', '*', '*'];
      this.validCron = false;
      this.modelChanged(this.cron.join(' '));
    } else {
      this.validCron = true;
      this.modelChanged(this.value);
    }
  }

  validateCron(value: string): boolean {
    const validationOptions = { seconds: true, allowBlankDay: true, alias: true };
    const slicedCron = value.replace(/\s+/g, ' ').split(' ').slice(0, 6).join(' ');
    return isValidCron(slicedCron, validationOptions);
  }

  fromCron(value: string) {
    const showCron: string[] = value.replace(/\s+/g, ' ').split(' ');

    if (showCron[1] !== '*' && isNaN(+showCron[1])) {
      this.base = this.frequencies[0].value;
      this.minuteValue = +showCron[1].replace('0/', '');
      this.readableCronExpression = cronstrue.toString(value);
    } else if (showCron[1] !== '*' && !isNaN(+showCron[1]) && showCron[2] === '*') {
      this.base = this.frequencies[1].value;
      this.hourValue = +showCron[1];
      this.readableCronExpression = cronstrue.toString(value);
    } else if (showCron[2] !== '*' && !isNaN(+showCron[2])) {
      this.base = this.frequencies[2].value;
      this.dayValue = +showCron[2];
      this.readableCronExpression = cronstrue.toString(this.value);
    }
    this.validCron = this.validateCron(value) ? true : false;
  }

  validationMessage(value: string): void {
    if (this.isShow) {
      this.confirmationDialogService.confirm(
        ConfirmationDialogTypes.Info,
        texts.VALIDATE_CRON_CONFIRMATION_TITTLE,
        texts.VALIDATE_CRON_CONFIRMATION_CONTENT,
      );
    }
  }
  onMinuteSelect(option): void {
    this.minuteValue = option;
    const cronMinute = `0/${this.minuteValue}`;
    this.cron = ['0', cronMinute, '*', '?', '*', '*', '*'];
    this.modelChanged(this.cron.join(' '));
  }

  onHourSelect(option): void {
    this.hourValue = option;
    this.cron = ['0', `${this.hourValue}`, '*', '?', '*', '*', '*'];
    this.modelChanged(this.cron.join(' '));
  }

  onDaySelect(option): void {
    this.dayValue = option;
    this.cron = ['0', '0', `${this.dayValue}`, '?', '*', '*', '*'];
    this.modelChanged(this.cron.join(' '));
  }

  modelChanged(value: string): void {
    this.value = value;
    this.fromCron(this.value);
    this.valueChanges.next(new WorkflowEntryModel(this.property, this.value));
  }
}
