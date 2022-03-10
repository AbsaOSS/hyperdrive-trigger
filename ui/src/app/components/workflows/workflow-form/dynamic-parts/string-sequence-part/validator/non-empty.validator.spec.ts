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
import { NonEmptyValidator } from './non-empty.validator';
import { FormControl } from '@angular/forms';

describe('NonEmptyValidator', () => {
  let underTest: NonEmptyValidator;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [NonEmptyValidator],
      }).compileComponents();
      underTest = TestBed.inject(NonEmptyValidator);
    }),
  );

  it('should be created', () => {
    expect(underTest).toBeTruthy();
  });

  it('validate() should return null when is valid and required', () => {
    underTest.isRequired = true;
    const control = new FormControl('SomeValue');

    expect(underTest.validate(control)).toBeNull();
  });

  it('validate() should return null when is invalid and not required', () => {
    underTest.isRequired = false;

    expect(underTest.validate(new FormControl(''))).toBeNull();
    expect(underTest.validate(new FormControl(null))).toBeNull();
    expect(underTest.validate(new FormControl())).toBeNull();
  });

  it('validate() should return invalid when is invalid and required', () => {
    underTest.isRequired = true;

    expect(underTest.validate(new FormControl())).toEqual({ nonEmptyValidator: true });
    expect(underTest.validate(new FormControl(''))).toEqual({ nonEmptyValidator: true });
    expect(underTest.validate(new FormControl(null))).toEqual({ nonEmptyValidator: true });
  });
});
