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
import { ConfirmationDialogService } from '../../../../../services/confirmation-dialog/confirmation-dialog.service';
import { ConfirmationDialogTypes } from '../../../../../constants/confirmationDialogTypes.constants';
import { texts } from '../../../../../constants/texts.constants';
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
  readableCronExpression: string;
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
  invalidCronExpression = texts.VALIDATE_CRON_CONFIRMATION_MESSAGE;

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
    this.freq = !this.minuteValue && !this.hourValue && !this.dayValue ? this.frequencies[1].value : this.frequencies[0].value;
  }

  ngOnDestroy(): void {
    !!this.quatzDetailsSubscription && this.quatzDetailsSubscription.unsubscribe();
  }

  fromCron(value: string) {
    const showCron: string[] = value.replace(/\s+/g, ' ').split(' ');

    if (showCron[1] !== '*' && isNaN(+showCron[1])) {
      this.base = this.userFriendly[0].value;
      this.minuteValue = +showCron[1].replace('0/', '');
    } else if (showCron[1] !== '*' && !isNaN(+showCron[1]) && showCron[2] === '*') {
      this.base = this.userFriendly[1].value;
      this.hourValue = +showCron[1];
    } else if (showCron[2] !== '*' && !isNaN(+showCron[2])) {
      this.base = this.userFriendly[2].value;
      this.dayMinuteValue = +showCron[1];
      this.dayValue = +showCron[2];
    }
    this.freq = this.frequencies[0].value;
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
