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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertComponent } from './alert.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '../../services/alert.service';
import { By } from '@angular/platform-browser';

describe('AlertComponent', () => {
    let component: AlertComponent;
    let fixture: ComponentFixture<AlertComponent>;
    let alertService: AlertService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AlertComponent],
            providers: [AlertService],
            imports: [RouterTestingModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AlertComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        alertService = TestBed.inject(AlertService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    const displayAlertParameters = [
        { type: 'success', class: 'alert-success', alertMethod: (message: string): void => alertService.success(message) },
        { type: 'info', class: 'alert-info', alertMethod: (message: string): void => alertService.info(message) },
        { type: 'warning', class: 'alert-warning', alertMethod: (message: string): void => alertService.warn(message) },
        { type: 'error', class: 'alert-error', alertMethod: (message: string): void => alertService.error(message) },
    ];
    displayAlertParameters.forEach(param => {
        it(`should display ${param.type} alert`, async(() => {
            // 1. display message
            const message = 'message';
            param.alertMethod(message);
            fixture.detectChanges();

            // verify
            const alerts = fixture.debugElement.queryAll(By.css('.alert'));
            expect(alerts.length).toBe(1);
            expect(alerts[0].nativeNode.classList).toContain(param.class);
            expect(alerts[0].childNodes[0].nativeNode.textContent.trim()).toBe(message);

            // 2. close message
            alerts[0].childNodes[1].nativeNode.click();

            // verify
            fixture.whenStable().then(() => {
                expect(component.alerts.length).toBe(0);
            });
        }));
    });

    it('should display multiple messages', () => {
        // 1. display messages
        alertService.success('success');
        alertService.error('error');
        alertService.success('success 2');
        alertService.warn('warn');
        alertService.success('success 3');
        alertService.info('info');
        fixture.detectChanges();

        // verify
        const alerts = fixture.debugElement.queryAll(By.css('.alert'));
        expect(alerts.length).toBe(6);
        expect(alerts[0].childNodes[0].nativeNode.textContent.trim()).toBe('success');
        expect(alerts[1].childNodes[0].nativeNode.textContent.trim()).toBe('error');
        expect(alerts[2].childNodes[0].nativeNode.textContent.trim()).toBe('success 2');
        expect(alerts[3].childNodes[0].nativeNode.textContent.trim()).toBe('warn');
        expect(alerts[4].childNodes[0].nativeNode.textContent.trim()).toBe('success 3');
        expect(alerts[5].childNodes[0].nativeNode.textContent.trim()).toBe('info');
    });
});
