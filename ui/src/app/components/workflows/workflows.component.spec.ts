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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowsComponent } from './workflows.component';
import {MockStore, provideMockStore} from "@ngrx/store/testing";
import * as fromApp from "../../stores/app.reducers";

describe('WorkflowsComponent', () => {
  // let component: WorkflowsComponent;
  // let fixture: ComponentFixture<WorkflowsComponent>;
  //
  // const initialAppState = {
  //   workflows: {
  //     loading: true
  //   }
  // };
  //
  // beforeEach(async(() => {
  //   TestBed.configureTestingModule({
  //     providers: [
  //       provideMockStore({ initialState: initialAppState })
  //     ],
  //     declarations: [ WorkflowsComponent ]
  //   })
  //   .compileComponents();
  // }));
  //
  // beforeEach(() => {
  //   fixture = TestBed.createComponent(WorkflowsComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });
  //
  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
