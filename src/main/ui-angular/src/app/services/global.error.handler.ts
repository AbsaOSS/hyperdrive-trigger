/*
 * Copyright 2018-2019 ABSA Group Limited
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

import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from './alert.service';
import { Router } from '@angular/router';
import { routeName } from '../app.routes';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    static readonly STORAGE_ID_ERROR: string = 'error';

    constructor(private injector: Injector, private ngZone: NgZone) {}
    handleError(error: Error | HttpErrorResponse): void {
        const notificationService = this.injector.get(AlertService);
        const router = this.injector.get(Router);
        if (error instanceof HttpErrorResponse) {
            // Server or connection error happened
            if (!navigator.onLine) {
                // Handle offline error
                this.ngZone.run(() =>
                    notificationService.error('Problem connecting. ' + 'Please check your internet connection and reload the page.'),
                );
            } else if (error.status === 401 || error.status === 403) {
                // router.navigate within zone does not work here
                // ngZone.run(() => router.navigate(['/signin'], {queryParams: {returnUrl: router.url}}));
                // See https://stackoverflow.com/questions/47288678/how-to-redirect-correctly-in-a-global-error-handler
                location.href = `/#/${routeName.LOGIN}?returnUrl=${router.url}`;
            } else {
                this.ngZone.run(() =>
                    notificationService.error(
                        'An unexpected error occurred.' + `Please try again or report this error: ${error.status} - ${error.message}`,
                    ),
                );
            }
        } else {
            // Handle Client Errors (Angular Error, ReferenceError...)
            sessionStorage.setItem(GlobalErrorHandler.STORAGE_ID_ERROR, error.toString());
            location.href = `/#/${routeName.ERROR}`;
        }
        // Log the error anyway
        console.error(error);
    }
}
