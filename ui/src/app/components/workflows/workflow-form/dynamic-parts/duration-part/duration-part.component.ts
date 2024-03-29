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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { UuidUtil } from '../../../../../utils/uuid/uuid.util';
import { texts } from 'src/app/constants/texts.constants';

@Component({
  selector: 'app-duration-part',
  templateUrl: './duration-part.component.html',
  styleUrls: ['./duration-part.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
})
export class DurationPartComponent implements OnInit {
  uuid = UuidUtil.createUUID();
  @Input() isShow: boolean;
  @Input() name: string;
  @Input() value: number;
  @Output() valueChange: EventEmitter<number> = new EventEmitter();
  @Input() isRequired = false;
  @Input() helperText: string;

  texts = texts;

  days: number;
  hours: number;
  minutes: number;
  seconds: number;

  oneDay = 86400;
  oneHour = 3600;
  oneMinute = 60;

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    if (!this.value) {
      this.modelChanged(0);
    } else {
      this.convertFromTotalSeconds(this.value);
    }
  }

  convertFromTotalSeconds(totalSeconds: number): void {
    const totalSecondsNotNull = totalSeconds ?? 0;
    this.days = this.quotient(totalSecondsNotNull, this.oneDay);
    this.hours = this.quotient(totalSecondsNotNull % this.oneDay, this.oneHour);
    this.minutes = this.quotient(totalSecondsNotNull % this.oneHour, this.oneMinute);
    this.seconds = totalSecondsNotNull % this.oneMinute;
  }

  convertToTotalSeconds(): number {
    return this.oneDay * (this.days ?? 0) + this.oneHour * (this.hours ?? 0) + this.oneMinute * (this.minutes ?? 0) + (this.seconds ?? 0);
  }

  quotient(numerator: number, denominator: number): number {
    return Math.floor(numerator / denominator);
  }

  daysChanged(days: number): void {
    this.days = days;
    this.modelChanged(this.convertToTotalSeconds());
  }

  hoursChanged(hours: number): void {
    this.hours = hours;
    this.modelChanged(this.convertToTotalSeconds());
  }

  minutesChanged(minutes: number): void {
    this.minutes = minutes;
    this.modelChanged(this.convertToTotalSeconds());
  }

  secondsChanged(seconds: number): void {
    this.seconds = seconds;
    this.modelChanged(this.convertToTotalSeconds());
  }

  modelChanged(value: number) {
    this.convertFromTotalSeconds(value);
    this.valueChange.emit(value);
  }
}
