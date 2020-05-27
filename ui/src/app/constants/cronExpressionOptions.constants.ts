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

export const userFriendly = {
  OPTIONS: [
    {
      value: 1,
      label: 'Hour every',
    },
    {
      value: 2,
      label: 'Hour at',
    },
    {
      value: 3,
      label: 'Day',
    },
  ],
};

export enum EveryHour {
  Zero = 0,
  One,
  Two,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,
  Ten,
  Eleven,
  Twelve,
  Thirteen,
  Fourteen,
  Fifteen,
  Sixtenn,
  Seventeen,
  Eighteen,
  Nineteen,
  Twenty,
  TwentyOne,
  TwentyTwo,
  TwentyThree,
}
export enum EveryMinute {
  TwentyFive = 25,
  Thirty = 30,
  ThirtyFive = 35,
  Forty = 40,
  FortyFive = 45,
  Fifty = 50,
  FiftyFive = 55,
}

export const Frequecies = {
  OPTIONS: [
    {
      value: 1,
      label: 'User friendly input',
    },
    {
      value: 2,
      label: 'Free text cron expression ',
    },
  ],
};
