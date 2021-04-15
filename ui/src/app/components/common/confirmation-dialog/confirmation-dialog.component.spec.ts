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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog/confirmation-dialog.service';

describe('ConfirmationDialogComponent', () => {
  let underTest: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;
  let confirmationDialogService: ConfirmationDialogService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [ConfirmationDialogService],
        declarations: [ConfirmationDialogComponent],
      }).compileComponents();
      confirmationDialogService = TestBed.inject(ConfirmationDialogService);
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it('constructor should set component properties', () => {
    expect(underTest.confirmationDialogData).toBeDefined();
  });

  describe('close()', () => {
    const parameters = [true, false];

    parameters.forEach((parameter) => {
      it('should call confirmation dialog service with ' + parameter + ' when called with ' + parameter, () => {
        const result = parameter;
        const subjectSpy = spyOn(confirmationDialogService, 'close');
        underTest.close(result);
        expect(subjectSpy).toHaveBeenCalled();
        expect(subjectSpy).toHaveBeenCalledWith(result);
      });
    });
  });
});
