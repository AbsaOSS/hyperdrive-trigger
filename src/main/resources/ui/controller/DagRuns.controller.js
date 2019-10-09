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

sap.ui.define([
    './BaseController'
], function (BaseController) {
    "use strict";
    return BaseController.extend("hyperdriver.controller.DagRuns", {

        onInit: function () {
            this.getView().setModel(new sap.ui.model.json.JSONModel());
            this._model = this.getView().getModel();
            this.getRouter().getRoute("dagRuns").attachPatternMatched(this._onRunsMatched, this);
        },

        onDagPress: function (oEvent) {
            this.getRouter().navTo("workflowRuns", {
                dagId: oEvent.getSource().getBindingContext().getProperty("dagId")
            });
        },

        onRefreshPress: function () {
            this._loadDagRuns()
        },

        onBackPress: function () {
            this.myNavBack("runs");
        },

        _loadDagRuns: function () {
            RunRepository.getPerDagStatistics(this._model.getProperty("/workflowId"), this._model);
        },

        _onRunsMatched: function (oEvent) {
            this._model.setProperty("/workflowId", oEvent.getParameter("arguments").workflowId);
            this._loadDagRuns();
        }

    });
});