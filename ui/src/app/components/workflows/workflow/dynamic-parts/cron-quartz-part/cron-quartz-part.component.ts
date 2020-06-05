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
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../../../../models/workflowEntry.model';
import { userFriendly } from '../../../../../constants/cronExpressionOptions.constants';
import { EveryMinute } from '../../../../../constants/cronExpressionOptions.constants';
import { EveryHour } from '../../../../../constants/cronExpressionOptions.constants';
import { Frequecies } from '../../../../../constants/cronExpressionOptions.constants';
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
  freq: number;
  dayValue: number;
  hourValue: number;
  validCron: boolean;
  minuteValue: number;
  dayMinuteValue: number;
  readableCronExpression: string;

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

  cron: string[] = [];
  frequencies = Frequecies.OPTIONS;
  userFriendly = userFriendly.OPTIONS;
  invalidCronExpression = texts.VALIDATE_CRON_CONFIRMATION_MESSAGE;

  constructor(private confirmationDialogService: ConfirmationDialogService) {
    // do nothing
  }

  ngOnInit(): void {
    // // this.value = '0,17,23,41 0 0 ? * * *';
    this.value = '0 10 * ? * * *';
    // console.log(this.value.length);
    console.log(cronstrue.toString(this.value).length);

    if (!this.value) {
      this.cron = ['0', '0', '0', '?', '*', '*', '*'];
      this.modelChanged(this.cron.join(' '));
    } else if (!this.validateCron(this.value)) {
      this.cron = ['0', '0', '0', '?', '*', '*', '*'];
      this.validCron = false;
      this.validationMessage();
      this.modelChanged(this.cron.join(' '));
    } else {
      this.validCron = true;
      this.modelChanged(this.value);
    }
    this.checkReadableMessage(this.value);
  }

  validateCron(value: string): boolean {
    const validationOptions = { seconds: true, allowBlankDay: true, alias: true };
    const slicedCron = value.replace(/\s+/g, ' ').split(' ').slice(0, 6).join(' ');
    return isValidCron(slicedCron, validationOptions);
  }

  fromCron(value: string) {
    const showCron: string[] = value.replace(/\s+/g, ' ').split(' ');

    if (showCron[1] !== '*' && isNaN(+showCron[1])) {
      this.base = this.userFriendly[0].value;
      this.minuteValue = +showCron[1].replace('0/', '');
      this.readableCronExpression = cronstrue.toString(value);
    } else if (showCron[1] !== '*' && !isNaN(+showCron[1]) && showCron[2] === '*') {
      this.base = this.userFriendly[1].value;
      this.hourValue = +showCron[1];
      this.readableCronExpression = cronstrue.toString(value);
    } else if (showCron[2] !== '*' && !isNaN(+showCron[2])) {
      this.base = this.userFriendly[2].value;
      this.dayMinuteValue = +showCron[1];
      this.dayValue = +showCron[2];
      this.readableCronExpression = cronstrue.toString(this.value);
    }
  }

  validationMessage(): void {
    if (this.isShow) {
      this.confirmationDialogService.confirm(
        ConfirmationDialogTypes.Info,
        texts.VALIDATE_CRON_CONFIRMATION_TITTLE,
        texts.VALIDATE_CRON_CONFIRMATION_CONTENT,
      );
    }
  }

  checkReadableMessage(value: string): void {
    this.freq = cronstrue.toString(value).length > 30 ? this.frequencies[1].value : this.frequencies[0].value;

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

  onFreeText(text): void {
    this.freq = this.frequencies[1].value;
    if (this.validateCron(text)) {
      this.readableCronExpression = cronstrue.toString(text);
      this.validCron = true;
      this.modelChanged(text);
    } else {
      this.validCron = false;
      this.invalidCronExpression = 'please update with correct free text cron expression.';
    }
  }

  modelChanged(value: string): void {
    this.value = value;
    this.fromCron(this.value);
    this.valueChanges.next(WorkflowEntryModelFactory.create(this.property, this.value));
  }
}
