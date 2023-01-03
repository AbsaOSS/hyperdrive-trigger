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
import { UntypedFormControl } from '@angular/forms';
import { LengthValidator } from './length.validator';

describe('LengthValidator', () => {
  let underTest: LengthValidator;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [LengthValidator],
      }).compileComponents();
      underTest = TestBed.inject(LengthValidator);
    }),
  );

  it('should be created', () => {
    expect(underTest).toBeTruthy();
  });

  it('validate() should return null when is valid', () => {
    underTest.length = { min: 1, max: 1000 };
    const control = new UntypedFormControl('SomeValue');

    expect(underTest.validate(control)).toBeNull();
  });

  it('validate() should return null when is valid', () => {
    underTest.length = { min: 1, max: 1000 };
    const control = new UntypedFormControl('');

    expect(underTest.validate(control)).toBeNull();
  });

  it('validate() should return invalid when input is invalid', () => {
    underTest.length = { min: 2, max: 5 };
    expect(underTest.validate(new UntypedFormControl('a'))).toEqual({ lengthValidator: true });
    expect(underTest.validate(new UntypedFormControl('abcdef'))).toEqual({ lengthValidator: true });
    expect(underTest.validate(new UntypedFormControl('abc\n'))).toEqual({ lengthValidator: true });
    expect(underTest.validate(new UntypedFormControl('\nabc'))).toEqual({ lengthValidator: true });
    expect(underTest.validate(new UntypedFormControl('abcd\ne'))).toEqual({ lengthValidator: true });
  });
});
