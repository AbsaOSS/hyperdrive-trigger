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

import { HistoryDetailComponent } from './history-detail.component';

describe('HistoryDetailComponent', () => {
  let underTest: HistoryDetailComponent;
  let fixture: ComponentFixture<HistoryDetailComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [HistoryDetailComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryDetailComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it(
    'toggleHistoryDetailAccordion() should toggle a history detail',
    waitForAsync(() => {
      expect(underTest.isHistoryDetailHidden).toBeFalsy();
      underTest.toggleHistoryDetailAccordion();
      expect(underTest.isHistoryDetailHidden).toBeTruthy();
      underTest.toggleHistoryDetailAccordion();
      expect(underTest.isHistoryDetailHidden).toBeFalsy();
    }),
  );
});
