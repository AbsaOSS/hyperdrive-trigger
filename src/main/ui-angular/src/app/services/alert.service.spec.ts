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

import { TestBed } from '@angular/core/testing';
import { AlertService } from './alert.service';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertType } from '../models/alert';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { bufferCount } from 'rxjs/operators';

describe('AlertService', () => {
    let underTest: AlertService;
    let router: Router;

    @Component({ template: '' })
    class TestComponent {}

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestComponent],
            providers: [AlertService],
            imports: [RouterTestingModule.withRoutes([{ path: '**', component: TestComponent }])],
        });
        underTest = TestBed.get(AlertService);
        router = TestBed.get(Router);
    });

    it('should be created', () => {
        const service: AlertService = TestBed.get(AlertService);
        expect(service).toBeTruthy();
    });

    it('should create an alert message of type success', done => {
        // prepare
        const message = 'someMessage';

        // prepare assertions
        underTest.onAlert().subscribe(alert => {
            expect(alert.type).toBe(AlertType.Success);
            expect(alert.message).toBe(message);
            done();
        });

        // run
        underTest.success(message);
    });

    it('should create an alert message of type info', done => {
        // prepare
        const message = 'someMessage';

        // prepare assertions
        underTest.onAlert().subscribe(alert => {
            expect(alert.type).toBe(AlertType.Info);
            done();
        });

        // run
        underTest.info(message);
    });

    it('should create an alert message of type error', done => {
        // prepare
        const message = 'someMessage';

        // prepare assertions
        underTest.onAlert().subscribe(alert => {
            expect(alert.type).toBe(AlertType.Error);
            done();
        });

        // run
        underTest.error(message);
    });

    it('should create an empty alert message of type warn', done => {
        // prepare
        const message = 'someMessage';

        // prepare assertions
        underTest.onAlert().subscribe(alert => {
            expect(alert.type).toBe(AlertType.Warning);
            done();
        });

        // run
        underTest.warn(message);
    });

    it('should create an empty message', done => {
        // prepare assertions
        underTest.onAlert().subscribe(alert => {
            expect(alert.clearAll).toBe(true);
            done();
        });

        // run
        underTest.clear();
    });

    it('should clear alerts on page change', done => {
        // prepare
        const message0 = 'message 0';
        const message1 = 'message 1';

        // prepare assertions
        underTest
            .onAlert()
            .pipe(bufferCount(3))
            .subscribe(alerts => {
                expect(alerts[0].message).toBe(message0);
                expect(alerts[1].message).toBe(message1);
                expect(alerts[2].clearAll).toBe(true);
                done();
            });

        // run
        underTest.success(message0);
        underTest.success(message1);
        router.navigate(['/somewhere']);
    });
});
