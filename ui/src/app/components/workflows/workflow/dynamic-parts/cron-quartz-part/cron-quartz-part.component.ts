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

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, Subscription } from 'rxjs';
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../../../../models/workflowEntry.model';
import { userFriendly } from '../../../../../constants/cronExpressionOptions.constants';
import { EveryMinute } from '../../../../../constants/cronExpressionOptions.constants';
import { EveryHour } from '../../../../../constants/cronExpressionOptions.constants';
import { Frequecies } from '../../../../../constants/cronExpressionOptions.constants';
import { QuartzExpressionDetailModel } from 'src/app/models/quartzExpressionDetail.model';
import { AppState, selectUtilState } from 'src/app/stores/app.reducers';
import { GetQuartzDetail } from '../../../../../stores/util/util.actions';
import { skip } from 'rxjs/operators';

@Component({
  selector: 'app-cron-quartz-part',
  templateUrl: './cron-quartz-part.component.html',
  styleUrls: ['./cron-quartz-part.component.scss'],
})
export class CronQuartzPartComponent implements OnInit, OnDestroy {
  @Input() isShow: boolean;
  @Input() name: string;
  @Input() value: string;
  @Input() property: string;
  @Input() valueChanges: Subject<WorkflowEntryModel>;

  base: number;
  freq: number;
  dayValue: number;
  hourValue: number;
  minuteValue: number;
  dayMinuteValue: number;
  loading = true;
  quatzDetailsSubscription: Subscription;
  quartzDetails: QuartzExpressionDetailModel[];

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
  quartzDetailse: any;
  frequencies = Frequecies.OPTIONS;
  userFriendly = userFriendly.OPTIONS;

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.store.dispatch(new GetQuartzDetail(this.value));

    this.quatzDetailsSubscription = this.store
      .select(selectUtilState)
      .pipe(skip(1))
      .subscribe((state) => {
        this.quartzDetailse = state.quartzExpressionDetail;
        this.loading = state.loading;
      });

    if (!this.value) {
      this.cron = ['0', '0', '0', '?', '*', '*', '*'];
      this.modelChanged(this.cron.join(' '));
    } else {
      this.modelChanged(this.value);
    }

    this.fromCron(this.value);
  }

  ngOnDestroy(): void {
    !!this.quatzDetailsSubscription && this.quatzDetailsSubscription.unsubscribe();
  }

  fromCron(value: string) {
    const showCron: string[] = value.replace(/\s+/g, ' ').split(' ');

    if (
      value === '0 0/5 * ? * * *' ||
      value === '0 0/10 * ? * * *' ||
      value === '0 0/15 * ? * * *' ||
      value === '0 0/20 * ? * * *' ||
      value === '0 0/25 * ? * * *' ||
      value === '0 0/30 * ? * * *'
    ) {
      this.freq = this.frequencies[0].value;
      this.base = this.userFriendly[0].value;
      this.minuteValue = +showCron[1].replace('0/', '');
    } else if (
      value === '0 0 * ? * * *' ||
      value === '0 5 * ? * * *' ||
      value === '0 10 * ? * * *' ||
      value === '0 15 * ? * * *' ||
      value === '0 20 * ? * * *' ||
      value === '0 25 * ? * * *' ||
      value === '0 30 * ? * * *' ||
      value === '0 35 * ? * * *' ||
      value === '0 40 * ? * * *' ||
      value === '0 45 * ? * * *' ||
      value === '0 50 * ? * * *' ||
      value === '0 55 * ? * * *'
    ) {
      this.freq = this.frequencies[0].value;
      this.base = this.userFriendly[1].value;
      this.hourValue = +showCron[1];
    } else if (
      value === '0 0 0 ? * * *' ||
      value === '0 0 1 ? * * *' ||
      value === '0 0 2 ? * * *' ||
      value === '0 0 3 ? * * *' ||
      value === '0 0 4 ? * * *' ||
      value === '0 0 5 ? * * *' ||
      value === '0 0 6 ? * * *' ||
      value === '0 0 7 ? * * *' ||
      value === '0 0 8 ? * * *' ||
      value === '0 0 9 ? * * *' ||
      value === '0 0 10 ? * * *' ||
      value === '0 0 11 ? * * *' ||
      value === '0 0 12 ? * * *' ||
      value === '0 0 13 ? * * *' ||
      value === '0 0 14 ? * * *' ||
      value === '0 0 15 ? * * *' ||
      value === '0 0 16 ? * * *' ||
      value === '0 0 17 ? * * *' ||
      value === '0 0 18 ? * * *' ||
      value === '0 0 19 ? * * *' ||
      value === '0 0 20 ? * * *' ||
      value === '0 0 21 ? * * *' ||
      value === '0 0 22 ? * * *' ||
      value === '0 0 23 ? * * *'
    ) {
      this.freq = this.frequencies[0].value;
      this.base = this.userFriendly[2].value;
      this.dayValue = +showCron[2];
    } else {
      this.freq = this.frequencies[1].value;
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

  onFreeText(text): void {
    this.freq = this.frequencies[1].value;
    this.store.dispatch(new GetQuartzDetail(text));
    this.modelChanged(text);
  }

  modelChanged(value: string): void {
    this.value = value;
    this.fromCron(this.value);
    this.valueChanges.next(WorkflowEntryModelFactory.create(this.property, this.value));
  }
}
