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

import { TestBed } from '@angular/core/testing';

import { ConfirmationDialogService } from './confirmation-dialog.service';
import { Subject } from 'rxjs';
import { ConfirmationDialogTypes } from '../../constants/confirmationDialogTypes.constants';
import { ConfirmationDialogDataModel } from '../../models/confirmationDialogData.model';

describe('ConfirmationDialogService', () => {
  let underTest: ConfirmationDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfirmationDialogService],
    });
    underTest = TestBed.inject(ConfirmationDialogService);
  });

  it('should be created', () => {
    expect(underTest).toBeTruthy();
  });

  it('confirm() should emit dialog properties', () => {
    const response = {
      isOpen: true,
      type: ConfirmationDialogTypes.YesOrNo,
      title: 'title',
      content: 'content',
    };
    const confirmationDialogDataModelSubject: Subject<ConfirmationDialogDataModel> = underTest['confirmationDialogDataSubject'];
    const confirmationDialogDataModelSubjectSpy = spyOn(confirmationDialogDataModelSubject, 'next');

    const result = underTest.confirm(response.type, response.title, response.content);

    expect(confirmationDialogDataModelSubjectSpy).toHaveBeenCalledTimes(1);
    expect(confirmationDialogDataModelSubjectSpy).toHaveBeenCalledWith(response);
    const resultChange: Subject<boolean> = underTest['resultChange'];
    expect(resultChange).toBeDefined();
    expect(result).toBeDefined();
    expect(result).toEqual(resultChange.asObservable());
  });

  it('close() should set isOpen in confirmation dialog data to false and emit result change whether dialog is accepted', () => {
    const response = {
      isOpen: true,
      type: ConfirmationDialogTypes.YesOrNo,
      title: 'title',
      content: 'content',
    };
    const closeInput = true;
    const confirmationDialogDataModelSubject: Subject<ConfirmationDialogDataModel> = underTest['confirmationDialogDataSubject'];
    const confirmationDialogDataModelSubjectSpy = spyOn(confirmationDialogDataModelSubject, 'next');

    underTest.confirm(response.type, response.title, response.content);

    const resultChange: Subject<boolean> = underTest['resultChange'];
    const resultChangeNextSpy = spyOn(resultChange, 'next');
    const resultChangeCompleteSpy = spyOn(resultChange, 'complete');

    underTest.close(closeInput);
    expect(confirmationDialogDataModelSubjectSpy).toHaveBeenCalledTimes(2);
    expect(confirmationDialogDataModelSubjectSpy).toHaveBeenCalledWith(response);
    expect(confirmationDialogDataModelSubjectSpy).toHaveBeenCalledWith({ isOpen: false });

    expect(resultChange).toBeDefined();
    expect(resultChangeNextSpy).toHaveBeenCalledTimes(1);
    expect(resultChangeNextSpy).toHaveBeenCalledWith(closeInput);
    expect(resultChangeCompleteSpy).toHaveBeenCalledTimes(1);
  });
});
