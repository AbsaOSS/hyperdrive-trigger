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

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {StringSequencePartComponent} from './string-sequence-part.component';
import {StringPartComponent} from "../string-part/string-part.component";
import {DebugElement, Input, Predicate} from "@angular/core";
import {By} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {Subject} from "rxjs";
import {WorkflowEntryModel} from "../../../../../models/workflowEntry.model";

describe('StringSequencePartComponent', () => {
  let component: StringSequencePartComponent;
  let fixture: ComponentFixture<StringSequencePartComponent>;
  let underTest: StringSequencePartComponent;

  const inputSelector: Predicate<DebugElement> = By.css('input[type="text"]');

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StringSequencePartComponent],
      imports: [ FormsModule ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StringSequencePartComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it('should set array with empty string on init when value is undefined', async(() => {
    const oldValue = undefined;
    const newValue = [''];
    const propertyName = 'property';
    const testedSubject = new Subject<WorkflowEntryModel>();
    const subjectSpy = spyOn(testedSubject, 'next');

    underTest.isShow = false;
    underTest.name = 'name';
    underTest.value = oldValue;
    underTest.property = propertyName;
    underTest.valueChanges = testedSubject;
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      let results = fixture.debugElement.queryAll(inputSelector);
      expect(results.length == 1).toBeTrue();
      expect(results[0].nativeElement.value).toBe(newValue[0]);
      expect(subjectSpy).toHaveBeenCalledTimes(1);
      expect(subjectSpy).toHaveBeenCalledWith(new WorkflowEntryModel(propertyName, newValue));
    });
  }));

  it('should set array with empty string on init when value is null', async(() => {
    const oldValue = null;
    const newValue = [''];
    const propertyName = 'property';
    const testedSubject = new Subject<WorkflowEntryModel>();
    const subjectSpy = spyOn(testedSubject, 'next');

    underTest.isShow = false;
    underTest.name = 'name';
    underTest.value = oldValue;
    underTest.property = propertyName;
    underTest.valueChanges = testedSubject;
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      let results = fixture.debugElement.queryAll(inputSelector);
      expect(results.length == 1).toBeTrue();
      expect(results[0].nativeElement.value).toBe(newValue[0]);
      expect(subjectSpy).toHaveBeenCalledTimes(1);
      expect(subjectSpy).toHaveBeenCalledWith(new WorkflowEntryModel(propertyName, newValue));
    });
  }));

  it('should change value and publish change on user input', async(() => {
    const oldItem = 'two';
    const newItem = 'changed';
    const oldValue = ['one', oldItem, 'three'];
    const newValue = ['one', newItem, 'three'];
    const propertyName = 'property';
    const testedSubject = new Subject<WorkflowEntryModel>();
    const subjectSpy = spyOn(testedSubject, 'next');

    underTest.isShow = false;
    underTest.name = 'name';
    underTest.value = oldValue;
    underTest.property = propertyName;
    underTest.valueChanges = testedSubject;

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const inputElement = fixture.debugElement.queryAll(inputSelector)[1];

      inputElement.nativeElement.value = newItem;
      inputElement.nativeElement.dispatchEvent(new Event('input'));

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const testedValue = fixture.debugElement.queryAll(inputSelector)[1].nativeElement.value;
        expect(testedValue).toBe(newItem);
        expect(subjectSpy).toHaveBeenCalled();
        expect(subjectSpy).toHaveBeenCalledWith(new WorkflowEntryModel(propertyName, newValue));
      });
    });
  }));

  it('onDeleteValue() should remove element from value and publish change', async(() => {
    const oldValue = ['one', 'two', 'three'];
    const newValue = ['one', 'three'];
    const propertyName = 'property';
    const testedSubject = new Subject<WorkflowEntryModel>();
    const subjectSpy = spyOn(testedSubject, 'next');

    underTest.isShow = false;
    underTest.name = 'name';
    underTest.value = oldValue;
    underTest.property = propertyName;
    underTest.valueChanges = testedSubject;

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      underTest.onDeleteValue(1);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const testedValue = fixture.debugElement.queryAll(inputSelector);
        const result = testedValue.map(element => element.nativeElement.value);
        expect(result).toEqual(newValue);
        expect(subjectSpy).toHaveBeenCalled();
        expect(subjectSpy).toHaveBeenCalledWith(new WorkflowEntryModel(propertyName, newValue));
      });
    });
  }));

  it('onAddValue() should add empty string to value and publish change', async(() => {
    const oldValue = ['one', 'two'];
    const newValue = ['one', 'two', ''];
    const propertyName = 'property';
    const testedSubject = new Subject<WorkflowEntryModel>();
    const subjectSpy = spyOn(testedSubject, 'next');

    underTest.isShow = false;
    underTest.name = 'name';
    underTest.value = oldValue;
    underTest.property = propertyName;
    underTest.valueChanges = testedSubject;

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      underTest.onAddValue();

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const testedValue = fixture.debugElement.queryAll(inputSelector);
        const result = testedValue.map(element => element.nativeElement.value);
        expect(result).toEqual(newValue);
        expect(subjectSpy).toHaveBeenCalled();
        expect(subjectSpy).toHaveBeenCalledWith(new WorkflowEntryModel(propertyName, newValue));
      });
    });
  }));

});
