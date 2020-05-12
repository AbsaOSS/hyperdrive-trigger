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
import { cronExpressionOptions } from '../../../../../constants/cronExpressionOptions.constants';

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

  base;
  dayValue;
  minuteValue;
  hourValue;

  hourValues = cronExpressionOptions.HOUR_VALUES;
  frequencies = cronExpressionOptions.FREQUENCIES;
  minuteValues = cronExpressionOptions.MINUTE_VALUES;
  minutesValues = cronExpressionOptions.MINUTES_VALUES;
  cron: string[] = [];

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    // do nothing
  }

  setCron(value, label) {
    this.cron = ['0', '0', '0', '?', '*', '*', '*'];
    switch (label) {
      case 'Hour every':
        this.cron[1] = `0/${value}`;
        break;
      case 'Hour at':
        this.cron[1] = value;
        break;
      case 'Day':
        this.cron[2] = value;
        break;
      default:
        this.cron = ['0', '0', '0', '?', '*', '*', '*'];
        break;
    }
    this.modelChanged();
  }

  fromCron(value: string) {
    const cron: string[] = value.replace(/\s+/g, ' ').split(' ');

    if (cron[1] === '*' && cron[2] === '*' && cron[3] === '*' && cron[4] === '*' && cron[5] === '?') {
      this.base = 1; // every minute
    } else if (cron[2] === '*' && cron[3] === '*' && cron[4] === '*' && cron[5] === '?') {
      this.base = 2; // every hour
    } else if (cron[3] === '*' && cron[4] === '*' && cron[5] === '?') {
      this.base = 3; // every day
    }
  }

  onMinuteSelect(option) {
    this.minuteValue = option;
    this.setCron(this.minuteValue, this.frequencies[0].label);
  }

  onHourSelect(option) {
    this.hourValue = option;
    this.setCron(this.hourValue, this.frequencies[1].label);
  }

  onDaySelect(option) {
    this.dayValue = option;
    this.setCron(this.dayValue, this.frequencies[2].label);
  }

  modelChanged() {
    this.value = this.cron.join(' ');
    this.valueChanges.next(new WorkflowEntryModel(this.property, this.value));
  }
}
