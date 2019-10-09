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

let WorkflowRepository = new function () {

    this.getWorkflows = function (model) {
        WSClient.get(
            "workflows",
            function(data) {
                model.setProperty("/workflows", data);
            },
            function() {
                new sap.m.MessageToast.show("Error while loading workflows", {animationDuration: 5000});
            }
        );
    };

    this.getWorkflowsByProjectName = function (projectName, model) {
        WSClient.get(
            "workflowsByProjectName?projectName="+projectName,
            function(data) {
                model.setProperty("/workflows", data);
            },
            function() {
                new sap.m.MessageToast.show("Error while loading workflows", {animationDuration: 5000});
            }
        );
    };

    this.getWorkflow = function (id, model) {
        WSClient.get(
            "workflow?id="+id,
            function(data) {
                let res = [];
                let obj = data.sensor.properties.matchProperties;
                Object.keys(obj).map(k => res.push({ keyField: k, valueField: obj[k] }));
                data.sensor.properties.matchProperties = res;
                data.dagDefinitionJoined.jobDefinitions.sort(function(f, s){return f.order - s.order});
                model.setProperty("/workflow", data);
            },
            function() {
                new sap.m.MessageToast.show("Error while loading workflow", {animationDuration: 5000});
            }
        );
    };

    this.getProjects = function (model) {
        WSClient.get(
            "workflows/projects",
            function(data) {
                model.setProperty("/projects", data);
            },
            function() {
                new sap.m.MessageToast.show("Error while loading projects", {animationDuration: 5000});
            }
        );
    };

    this.getProjectsInfo = function (model) {
        WSClient.get(
            "workflows/projectsInfo",
            function(data) {
                model.setProperty("/projectsInfo", data);
            },
            function() {
                new sap.m.MessageToast.show("Error while loading projects info", {animationDuration: 5000});
            }
        );
    };

    this.deleteWorkflow = function (id) {
        WSClient.delete(
            "workflows?id="+id,
            function() {
                new sap.m.MessageToast.show("Workflow deleted", {animationDuration: 5000});
            },
            function() {
                new sap.m.MessageToast.show("Error while deleting workflow", {animationDuration: 5000});
            }
        );
    };

    this.createWorkflow = function (workflow) {
        WSClient.put(
            "workflow",
            function() {
                new sap.m.MessageToast.show("Workflow created", {animationDuration: 5000});
            },
            function() {
                new sap.m.MessageToast.show("Error while creating workflow", {animationDuration: 5000});
            },
            workflow
        );
    };

    this.updateWorkflow = function (workflow) {
        WSClient.post(
            "workflows",
            function() {
                new sap.m.MessageToast.show("Workflow updated", {animationDuration: 5000});
            },
            function() {
                new sap.m.MessageToast.show("Error while updating workflow", {animationDuration: 5000});
            },
            workflow
        );
    };

    this.updateWorkflowActiveState = function (id, workflowState) {
        WSClient.post(
            "workflows/"+id+"/setActiveState",
            function() {
                new sap.m.MessageToast.show("Workflow updated", {animationDuration: 5000});
            },
            function() {
                new sap.m.MessageToast.show("Error while updating workflow", {animationDuration: 5000});
            },
            workflowState
        );
    };

    this.runWorkflow = function (workflowId) {
        WSClient.put(
            "workflow/run?workflowId="+workflowId,
            function() {
                new sap.m.MessageToast.show("Workflow has been deployed", {animationDuration: 5000});
            },
            function() {
                new sap.m.MessageToast.show("Error while deploying workflow", {animationDuration: 5000});
            },
            {}
        );
    }

}();