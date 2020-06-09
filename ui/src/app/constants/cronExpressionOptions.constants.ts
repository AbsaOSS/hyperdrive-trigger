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

export const HourEveryValues = [5, 10, 15, 20, 25, 30];

export const HourAtValues = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export const DayValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

export enum InputTypes {
  FREE_TEXT = 'Free text quartz cron expression',
  USER_FRIENDLY = 'User friendly input',
}

export enum Frequencies {
  HOUR_EVERY = 'Hour every',
  HOUR_AT = 'Hour at',
  DAY = 'Day',
}
