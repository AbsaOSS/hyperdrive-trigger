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

import { HyperdriveFieldsModel } from '../../models/hyperdriveFields.model';

export class HyperdriveUtil {
  static updateOrPushAppArgument(appArguments: string[], appArgumentPrefix: string, appArgumentValue: string): string[] {
    const appArgumentsToUpdate = [...appArguments];
    const appArgumentIndex = appArgumentsToUpdate.findIndex((appArgument: string) => appArgument.startsWith(appArgumentPrefix));
    const newAppArgument = appArgumentPrefix + appArgumentValue;

    if (appArgumentIndex === -1) {
      appArgumentsToUpdate.push(newAppArgument);
    } else {
      appArgumentsToUpdate[appArgumentIndex] = newAppArgument;
    }
    return appArgumentsToUpdate;
  }

  static getHyperdriveTypeFromAppArguments(appArguments: string[], hyperdriveFields: HyperdriveFieldsModel[]): string {
    const matchedHyperdriveTypes = hyperdriveFields
      .map((hyperdriveField) => {
        const existAllFields = hyperdriveField.fields.every((value) => appArguments.findIndex((arg) => arg.startsWith(value)) > -1);
        const noExcludedFieldsExist = hyperdriveField.excludedFields.every(
          (value) => appArguments.findIndex((arg) => arg.startsWith(value)) == -1,
        );
        if (existAllFields && noExcludedFieldsExist) {
          return hyperdriveField.hyperdriveType;
        }
      })
      .filter((hyperdriveType: string) => hyperdriveType);
    if (matchedHyperdriveTypes.length == 1) {
      return matchedHyperdriveTypes[0];
    } else {
      return undefined;
    }
  }
}
