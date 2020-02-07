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

import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '../../services/auth.service';
import createSpy = jasmine.createSpy;
import { of, queueScheduler, throwError } from 'rxjs';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let authService: AuthService;
    let alertService: AlertService;
    let router: Router;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LoginComponent],
            providers: [AuthService, AlertService],
            imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        authService = TestBed.get(AuthService);
        alertService = TestBed.get(AlertService);
        router = TestBed.get(Router);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not submit the form if it has validation errors', () => {
        // given
        component.loginForm.controls.username.setValue('username'); // no password given -> invalid
        authService.login = createSpy();

        // when
        component.onSubmit();

        // then
        expect(authService.login).not.toHaveBeenCalled();
    });

    it('should redirect to the desired route if the backend returns a token', () => {
        // given
        component.loginForm.controls.username.setValue('username');
        component.loginForm.controls.password.setValue('password');
        component.returnUrl = 'some-return-url';
        authService.login = createSpy().and.returnValue(of('some-token'));
        router.navigate = createSpy();

        // when
        component.onSubmit();

        // then
        expect(authService.login).toHaveBeenCalledWith('username', 'password');
        expect(router.navigate).toHaveBeenCalledWith(['some-return-url']);
    });

    it('should display a specific error message if the backend returns 401', () => {
        // given
        component.loginForm.controls.username.setValue('username');
        component.loginForm.controls.password.setValue('password');
        authService.login = createSpy().and.returnValue(throwError({ status: 401 }, queueScheduler));
        alertService.error = createSpy();

        // when
        component.onSubmit();

        // then
        expect(authService.login).toHaveBeenCalledWith('username', 'password');
        expect(alertService.error).toHaveBeenCalledWith('Login failed. Please double-check username and password');
        expect(component.loading).toBe(false);
    });

    // TODO: Catching the error does not work
    xit('should throw an error if the backend returns an error other than 401', async(() => {
        // given
        component.loginForm.controls.username.setValue('username');
        component.loginForm.controls.password.setValue('password');
        authService.login = createSpy().and.returnValue(throwError({ status: 500 }, queueScheduler));

        // when, then
        try {
            component.onSubmit();
        } catch (e) {
            expect(e).toBe({ status: 500 });
        }
    }));
});
