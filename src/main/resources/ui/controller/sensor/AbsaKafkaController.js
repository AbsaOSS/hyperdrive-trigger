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

class AbsaKafkaController {

    constructor(model) {
        this._model = model;
    }

    onShow() {
        let path = "/workflow/sensor/properties/matchProperties";
        let matchProperties = this._model.getProperty(path);
        if(!(matchProperties && matchProperties.length === 1 && matchProperties.some(e => e.keyField === 'ingestionToken'))) {
            this._model.setProperty(path, [{"keyField": "ingestionToken", "valueField": UUIDGenerator.getUUID()}])
        }
    }

    onAddServer() {
        UiListMethods.addListItem("/workflow/sensor/properties/settings/maps/servers", this._model, "")
    }

    onDeleteServer(oEv) {
        UiListMethods.deleteListItem("/workflow/sensor/properties/settings/maps/servers", this._model, oEv)
    }

}
