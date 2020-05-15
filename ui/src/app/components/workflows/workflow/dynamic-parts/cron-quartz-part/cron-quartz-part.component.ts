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
  showFrequency: string;
  cronValue: number;
  showGuard: number;

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
      this.showGuard = this.frequencies[0].value;
      this.cronValue = +showCron[1].replace('0/', ' ');
      this.showFrequency = this.frequencies[0].label;
    } else if (showCron[1] !== '*' && !isNaN(+showCron[1])) {
      this.showGuard = this.frequencies[1].value;
      this.cronValue = +showCron[1];
      this.showFrequency = this.frequencies[1].label;
    } else if (showCron[2] !== '*' && !isNaN(+showCron[2])) {
      this.showGuard = this.frequencies[2].value;
      this.cronValue = +showCron[2];
      this.showFrequency = this.frequencies[2].label;
    }
  }

  onMinuteSelect(option): void {
    this.minuteValue = option;
    const cronMinute = `0/${this.minuteValue}`;
    this.cron = ['0', cronMinute, '0', '?', '*', '*', '*'];
    this.modelChanged();
  }

  onHourSelect(option): void {
    this.hourValue = option;
    this.cron = ['0', `${this.hourValue}`, '0', '?', '*', '*', '*'];
    this.modelChanged();
  }

  onDaySelect(option): void {
    this.dayValue = option;
    this.cron = ['0', '0', `${this.dayValue}`, '?', '*', '*', '*'];
    this.modelChanged();
  }

  modelChanged(): void {
    this.value = this.cron.join(' ');
    this.valueChanges.next(new WorkflowEntryModel(this.property, this.value));
  }
}
