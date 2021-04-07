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

import { TestBed, waitForAsync } from '@angular/core/testing';
import { CronQuartzExpressionValidator } from './cron-quartz-expression.validator';

describe('CronQuartzExpressionValidator', () => {
  let underTest: CronQuartzExpressionValidator;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [CronQuartzExpressionValidator],
      }).compileComponents();
      underTest = TestBed.inject(CronQuartzExpressionValidator);
    }),
  );

  it('should be created', () => {
    expect(underTest).toBeTruthy();
  });

  it('validate() should return null when is valid', () => {
    underTest.params = true;
    expect(underTest.validate(undefined)).toBeNull();
  });

  it('validate() should return invalid when is invalid', () => {
    underTest.params = false;
    expect(underTest.validate(undefined)).toEqual({ cronQuartzInvalid: true });
  });
});
