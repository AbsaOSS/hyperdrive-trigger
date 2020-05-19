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
import { WorkflowEntryModel } from '../../../../../models/workflowEntry.model';
import { sensorFrequency } from '../../../../../constants/cronExpressionOptions.constants';
import { EveryMinute } from '../../../../../constants/cronExpressionOptions.constants';
import { EveryHour } from '../../../../../constants/cronExpressionOptions.constants';

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
  cron: string[] = [];

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    if (!this.value) {
      this.cron = ['*', '*', '0', '?', '*', '*', '*'];
      this.modelChanged();
    }
    if (this.value) {
      this.fromCron(this.value);
    }
  }

  fromCron(value: string) {
    const showCron: string[] = value.replace(/\s+/g, ' ').split(' ');

    if (showCron[1] !== '*' && isNaN(+showCron[1])) {
      this.base = this.frequencies[0].value;
      this.minuteValue = +showCron[1].replace('0/', ' ');
    } else if (showCron[1] !== '*' && !isNaN(+showCron[1])) {
      this.base = this.frequencies[1].value;
      this.hourValue = +showCron[1];
    } else if (showCron[2] !== '*' && !isNaN(+showCron[2])) {
      this.base = this.frequencies[2].value;
      this.dayValue = +showCron[2];
    }
  }

  validCron(value: string): void {
  }
  onMinuteSelect(option): void {
    this.minuteValue = option;
    const cronMinute = `0/${this.minuteValue}`;
    this.cron = ['*', cronMinute, '*', '?', '*', '*', '*'];
    this.modelChanged();
  }

  onHourSelect(option): void {
    this.hourValue = option;
    this.cron = ['*', `${this.hourValue}`, '*', '?', '*', '*', '*'];
    this.modelChanged();
  }

  onDaySelect(option): void {
    this.dayValue = option;
    this.cron = ['*', '*', `${this.dayValue}`, '?', '*', '*', '*'];
    this.modelChanged();
  }

  modelChanged(): void {
    this.value = this.cron.join(' ');
    console.log('sending this cron ' + this.value);
    this.valueChanges.next(new WorkflowEntryModel(this.property, this.value));
  }
}
