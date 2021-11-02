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

import {HyperdriveUtil} from "./hyperdrive.util";
import {HyperdriveFieldsModel} from "../../models/hyperdriveFields.model";

describe('HyperdriveUtil', () => {
  describe('updateOrPushAppArgument', () => {
    it('should push prefix+value into array if app arguments does not contain prefix', () => {
      const appArguments = ['key=value'];
      const appArgumentPrefix = 'newAppArgumentPrefix='
      const appArgumentValue = 'newAppArgumentValue'

      const expectedResult = [...appArguments, appArgumentPrefix + appArgumentValue];

      const result = HyperdriveUtil.updateOrPushAppArgument(appArguments, appArgumentPrefix, appArgumentValue);
      expect(result).toEqual(expectedResult);
    });

    it('should update element in array if element starts with prefix', () => {
      const appArgumentPrefix = 'key='
      const appArguments = [appArgumentPrefix + 'value'];
      const appArgumentValue = 'newAppArgumentValue'

      const expectedResult = [appArgumentPrefix + appArgumentValue];

      const result = HyperdriveUtil.updateOrPushAppArgument(appArguments, appArgumentPrefix, appArgumentValue);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getHyperdriveTypeFromAppArguments', () => {
    it('should return undefined if no hyperdrive fields does not match app arguments', () => {
      const appArguments = ['key=value'];
      const hyperdriveFields = [
        new HyperdriveFieldsModel(
          'typeOne', ['typeOneField1', 'typeOneField2'], ['typeOneField3']
        ),
        new HyperdriveFieldsModel(
          'typeTwo', ['typeTwoField1', 'typeTwoField2'], ['typeTwoField3']
        ),
      ];

      const result = HyperdriveUtil.getHyperdriveTypeFromAppArguments(appArguments, hyperdriveFields);
      expect(result).toEqual(undefined);
    });

    it('should return undefined if more than one hyperdrive fields match app arguments', () => {
      const appArguments = ['sameField1=value1', 'sameField2=value2'];
      const hyperdriveFields = [
        new HyperdriveFieldsModel(
          'typeOne', ['sameField1', 'sameField2'], ['sameField3']
        ),
        new HyperdriveFieldsModel(
          'typeTwo', ['sameField1', 'sameField2'], ['sameField3']
        ),
      ];

      const result = HyperdriveUtil.getHyperdriveTypeFromAppArguments(appArguments, hyperdriveFields);
      expect(result).toEqual(undefined);
    });

    it('should return undefined if not all hyperdrive fields match app arguments of the same type', () => {
      const appArguments = ['typeOneField1=value'];
      const hyperdriveFields = [
        new HyperdriveFieldsModel(
          'typeOne', ['typeOneField1', 'typeOneField2'], ['typeOneField3']
        )
      ];

      const result = HyperdriveUtil.getHyperdriveTypeFromAppArguments(appArguments, hyperdriveFields);
      expect(result).toEqual(undefined);
    });

    it('should return undefined if all hyperdrive fields match app arguments of the same type but match also excluded fields', () => {
      const appArguments = ['typeOneField1=value1', 'typeOneField2=value1', "typeOneField3=value3"];
      const hyperdriveFields = [
        new HyperdriveFieldsModel(
          'typeOne', ['typeOneField1', 'typeOneField2'], ['typeOneField3']
        )
      ];

      const result = HyperdriveUtil.getHyperdriveTypeFromAppArguments(appArguments, hyperdriveFields);
      expect(result).toEqual(undefined);
    });

    it('should return hyperdrive type if app arguments have exact match with hyperdrive fields and does not contain excluded fields', () => {
      const appArguments = ['typeOneField1=value1', 'typeOneField2=value1'];
      const hyperdriveFields = [
        new HyperdriveFieldsModel(
          'typeOne', ['typeOneField1', 'typeOneField2'], ['typeOneField3']
        ),
        new HyperdriveFieldsModel(
          'typeTwo', ['typeTwoField1', 'typeTwoField2'], ['typeTwoField3']
        ),
      ];

      const result = HyperdriveUtil.getHyperdriveTypeFromAppArguments(appArguments, hyperdriveFields);
      expect(result).toEqual(hyperdriveFields[0].hyperdriveType);
    });
  });
});
