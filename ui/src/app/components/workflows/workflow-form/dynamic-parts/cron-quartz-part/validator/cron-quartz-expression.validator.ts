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

import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, UntypedFormControl } from '@angular/forms';

@Directive({
  selector: '[cronQuartzExpressionValidator][ngModel]',
  /*eslint-disable */
  providers: [{ provide: NG_VALIDATORS, useExisting: CronQuartzExpressionValidator, multi: true }],
  /*eslint-enable */
})
export class CronQuartzExpressionValidator implements Validator {
  @Input('cronQuartzExpressionValidator') params: boolean;

  constructor() {
    // do nothing
  }

  validate(_: UntypedFormControl) {
    if (this.params) {
      return null;
    } else {
      return { cronQuartzInvalid: true };
    }
  }
}
