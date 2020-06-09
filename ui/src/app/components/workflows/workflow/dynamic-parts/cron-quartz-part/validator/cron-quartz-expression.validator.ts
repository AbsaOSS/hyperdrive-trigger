import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, FormControl } from '@angular/forms';

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

  validate(c: FormControl) {
    if (this.params) {
      return null;
    } else {
      return { cronQuartzInvalid: true };
    }
  }
}
