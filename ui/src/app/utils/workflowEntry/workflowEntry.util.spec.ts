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

import { WorkflowEntryUtil } from './workflowEntry.util';
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../models/workflowEntry.model';

describe('WorkflowEntryUtil', () => {
  it('getValue() should return value when it is defined', () => {
    const property = 'property.name';
    const value = 'value';
    const data: WorkflowEntryModel[] = [
      WorkflowEntryModelFactory.create('testPropOne', 'valueOne'),
      WorkflowEntryModelFactory.create('testPropTwo', true),
      WorkflowEntryModelFactory.create('testPropThree', 10),
      WorkflowEntryModelFactory.create(property, value),
    ];

    const result = WorkflowEntryUtil.getValue(property, data);

    expect(result).toBe(value);
  });

  it('getValue() should return undefined when property does not exist', () => {
    const propertyUndefined = 'property.name.undefined';
    const data: WorkflowEntryModel[] = [
      WorkflowEntryModelFactory.create('testPropOne', 'valueOne'),
      WorkflowEntryModelFactory.create('testPropTwo', true),
      WorkflowEntryModelFactory.create('testPropThree', 10),
    ];

    const result = WorkflowEntryUtil.getValue(propertyUndefined, data);

    expect(result).toBeUndefined();
  });

  it('getValue() should return undefined when data array is empty', () => {
    const propertyUndefined = 'property.name.undefined';
    const data: WorkflowEntryModel[] = [];

    const result = WorkflowEntryUtil.getValue(propertyUndefined, data);

    expect(result).toBeUndefined();
  });

  it('getValue() should return undefined when data array is undefined', () => {
    const propertyUndefined = 'property.name.undefined';
    const data: WorkflowEntryModel[] = undefined;

    const result = WorkflowEntryUtil.getValue(propertyUndefined, data);

    expect(result).toBeUndefined();
  });
});
