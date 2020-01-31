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

import {Component, OnInit} from '@angular/core';
import {routeName} from '../../app.routes';
import {GlobalErrorHandler} from '../../services/global.error.handler';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
})
export class ErrorComponent implements OnInit {
  error: string;
  defaultLink: string = `/${routeName.DEFAULT}`;

  constructor() {}

  ngOnInit() {
    this.error = sessionStorage.getItem(GlobalErrorHandler.STORAGE_ID_ERROR);
    sessionStorage.removeItem(GlobalErrorHandler.STORAGE_ID_ERROR);
  }
}
