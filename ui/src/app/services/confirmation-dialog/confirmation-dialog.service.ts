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

import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConfirmationDialogDataModel } from '../../models/confirmationDialogData.model';
import { ConfirmationDialogTypes } from '../../constants/confirmationDialogTypes.constants';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationDialogService {
  private confirmationDialogDataSubject: Subject<ConfirmationDialogDataModel> = new Subject<ConfirmationDialogDataModel>();
  confirmationDialogData: Observable<ConfirmationDialogDataModel> = this.confirmationDialogDataSubject.asObservable();

  private resultChange: Subject<boolean>;

  constructor() {
    // do nothing
  }

  confirm(type: ConfirmationDialogTypes, title: string, content: string): Observable<boolean> {
    this.confirmationDialogDataSubject.next({
      isOpen: true,
      type: type,
      title: title,
      content: content,
    });

    this.resultChange = new Subject<boolean>();
    return this.resultChange.asObservable();
  }

  close(accepted: boolean) {
    this.confirmationDialogDataSubject.next({ isOpen: false });

    this.resultChange.next(accepted);
    this.resultChange.complete();
  }
}
