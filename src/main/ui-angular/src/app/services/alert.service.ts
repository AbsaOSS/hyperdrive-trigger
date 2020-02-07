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

import { Injectable, OnDestroy } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { Alert, AlertType } from '../models/alert';

@Injectable({ providedIn: 'root' })
export class AlertService implements OnDestroy {
    private subject = new Subject<Alert>();
    private subscription: Subscription;

    constructor(private router: Router) {
        // clear alert messages on route change
        this.subscription = this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                // clear alert messages
                this.clear();
            }
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    // enable subscribing to alerts observable
    onAlert(): Observable<Alert> {
        return this.subject.asObservable();
    }

    // convenience methods
    success(message: string): void {
        this.alert(new Alert({ message, type: AlertType.Success }));
    }

    error(message: string): void {
        this.alert(new Alert({ message, type: AlertType.Error }));
    }

    info(message: string): void {
        this.alert(new Alert({ message, type: AlertType.Info }));
    }

    warn(message: string): void {
        this.alert(new Alert({ message, type: AlertType.Warning }));
    }

    // main alert method
    alert(alert: Alert): void {
        this.subject.next(alert);
    }

    // clear alerts
    clear(): void {
        this.subject.next(new Alert({ clearAll: true }));
    }
}
