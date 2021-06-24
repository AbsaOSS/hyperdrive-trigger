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

import { ApiUtil } from './api.util';
import { ApiErrorModel, ApiErrorModelFactory } from '../../models/errors/apiError.model';

describe('ApiUtil', () => {
  describe('isApiError', () => {
    it('should return false if string is passed', () => {
      const errorResponse = 'errorResponse';
      expect(ApiUtil.isApiError(errorResponse)).toBeFalsy();
    });

    it('should return false if wrong object is passed', () => {
      const errorResponse: Record<string, any> = { fieldOne: 'fieldOne', fieldTwo: true, fieldThree: { nestedField: 99 } };
      expect(ApiUtil.isApiError(errorResponse)).toBeFalsy();
    });

    it('should return false if array with wrong object is passed', () => {
      const errorResponse: Array<any> = [{ fieldOne: 'fieldOne', fieldTwo: true, fieldThree: { nestedField: 99 } }];
      expect(ApiUtil.isApiError(errorResponse)).toBeFalsy();
    });

    it('should return true if array with any error type is passed', () => {
      const errorResponse: ApiErrorModel[] = [
        ApiErrorModelFactory.create('message1', { name: 'validationError' }),
        ApiErrorModelFactory.create('message2', { name: 'someError' }),
      ];
      expect(ApiUtil.isApiError(errorResponse)).toBeTruthy();
    });
  });

  describe('isBackendValidationError', () => {
    it('should return false if string is passed', () => {
      const errorResponse = 'errorResponse';
      expect(ApiUtil.isBackendValidationError(errorResponse)).toBeFalsy();
    });

    it('should return false if correct object array is passed with incorrect error type', () => {
      const errorResponse: ApiErrorModel[] = [
        ApiErrorModelFactory.create('message1', { name: 'validationError' }),
        ApiErrorModelFactory.create('message2', { name: 'wrongName' }),
      ];
      expect(ApiUtil.isBackendValidationError(errorResponse)).toBeFalsy();
    });

    it('should return true if array with validation error is passed', () => {
      const errorResponse: ApiErrorModel[] = [
        ApiErrorModelFactory.create('message1', { name: 'validationError' }),
        ApiErrorModelFactory.create('message2', { name: 'validationError' }),
      ];
      expect(ApiUtil.isBackendValidationError(errorResponse)).toBeTruthy();
    });
  });
});
