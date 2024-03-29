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

import { ComboboxPartComponent } from './combobox-part.component';
import { FormsModule, NgForm } from '@angular/forms';

describe('ComboboxPartComponent', () => {
  let fixture: ComponentFixture<ComboboxPartComponent>;
  let underTest: ComboboxPartComponent;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ComboboxPartComponent],
        imports: [FormsModule],
        providers: [NgForm],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ComboboxPartComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it('should change value and publish change on user input', () => {
    const newValue1 = 'threeValue';
    const newValue2 = 'fourValue';

    spyOn(underTest.valueChange, 'emit');

    underTest.modelChanged([newValue1, newValue2]);
    expect(underTest.valueChange.emit).toHaveBeenCalled();
    expect(underTest.valueChange.emit).toHaveBeenCalledWith([newValue1, newValue2]);
  });
});
