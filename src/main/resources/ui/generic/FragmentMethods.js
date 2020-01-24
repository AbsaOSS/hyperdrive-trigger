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

let FragmentMethods = new function () {

    let _fragmentController = {};

    this.showFragmentIn = function (controllerName, fragmentName, fragmentLocation, destination, model) {
        let oFragmentController = _fragmentController[fragmentName];
        if (!oFragmentController) {
            let oController = eval("new " + controllerName + "(model)");
            let oFragment = sap.ui.xmlfragment(fragmentName, fragmentLocation + "." + fragmentName, oController);
            oFragmentController = {fragment: oFragment, controller: oController};
            _fragmentController[fragmentName] = oFragmentController;
        }
        destination.removeAllContent();
        oFragmentController.fragment.forEach(oElement =>
            destination.addContent(oElement)
        );
        oFragmentController.controller.onShow();
    };

}();
