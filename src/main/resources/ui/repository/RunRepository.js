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

let RunRepository = new function () {

    this.getOverallStatistics = function (model) {
        WSClient.get(
            "runs/overallStatistics",
            function(data) {
                model.setProperty("/overallStatistics", data);
            },
            function() {
                new sap.m.MessageToast.show("Error while loading statistics", {animationDuration: 5000});
            }
        );
    };

    this.getPerDagStatistics = function (workflowId, model) {
        WSClient.get(
            "runs/perDagStatistics?workflowId="+workflowId,
            function(data) {
                model.setProperty("/perDagStatistics", data);
            },
            function() {
                new sap.m.MessageToast.show("Error while loading per dag statistics", {animationDuration: 5000});
            }
        );
    };

    this.getPerProjectStatistics = function (model) {
        WSClient.get(
            "runs/perProjectStatistics",
            function(data) {
                model.setProperty("/perProjectStatistics", data);
            },
            function() {
                new sap.m.MessageToast.show("Error while loading per project statistics", {animationDuration: 5000});
            }
        );
    };

    this.getPerWorkflowStatistics = function (projectName, model) {
        WSClient.get(
            "runs/perWorkflowStatistics?projectName="+projectName,
            function(data) {
                model.setProperty("/perWorkflowStatistics", data);
            },
            function() {
                new sap.m.MessageToast.show("Error while loading runs", {animationDuration: 5000});
            }
        );
    };

    this.getRuns = function (dagInstanceId, model) {
        WSClient.get(
            "jobInstances?dagInstanceId="+dagInstanceId,
            function(data) {
                model.setProperty("/runs", data);
            },
            function() {
                new sap.m.MessageToast.show("Error while loading runs", {animationDuration: 5000});
            }
        );
    };

}();