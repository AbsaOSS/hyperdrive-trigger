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

class SparkController {

    constructor(model) {
        this._model = model;
    }

    onShow() {}

    onDeleteAppArgument(oEv) {
        UiListMethods.deleteListItem("/newJob/job/jobParameters/maps/appArguments", this._model, oEv)
    }

    onAddAppArgument() {
        UiListMethods.addListItem("/newJob/job/jobParameters/maps/appArguments", this._model, "");
    }

    onDeleteAdditionalJar(oEv) {
        UiListMethods.deleteListItem("/newJob/job/jobParameters/maps/additionalJars", this._model, oEv)
    }

    onAddAdditionalJar() {
        UiListMethods.addListItem("/newJob/job/jobParameters/maps/additionalJars", this._model, "");
    }

}