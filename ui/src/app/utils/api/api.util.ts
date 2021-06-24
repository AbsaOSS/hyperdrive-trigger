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

import { ApiErrorModel } from '../../models/errors/apiError.model';
import { BulkOperationErrorModel } from '../../models/errors/bulkOperationError.model';

export class ApiUtil {
  static concatenateApiErrors(apiErrors: ApiErrorModel[]): string {
    return apiErrors.map((apiError) => apiError.message).reduce((a, b) => `${a}\n${b}`);
  }

  static isApiError(errorResponse: any): boolean {
    return Array.isArray(errorResponse) && errorResponse.every((err) => this.isInstanceOfApiError(err));
  }

  static isInstanceOfApiError(object: any): object is ApiErrorModel {
    return 'message' in object;
  }

  static isBulkOperationError(errorResponse: any): boolean {
    return Array.isArray(errorResponse) && errorResponse.every((err) => this.isInstanceOfBulkOperationError(err));
  }

  static isInstanceOfBulkOperationError(object: any): object is BulkOperationErrorModel {
    return 'innerError' in object;
  }

  static isBackendValidationError(errorResponse: any): boolean {
    return this.isApiError(errorResponse) && errorResponse.every((err) => err.errorType.name == 'validationError');
  }
}
