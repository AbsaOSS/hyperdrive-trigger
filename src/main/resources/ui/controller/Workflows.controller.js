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
	'./BaseController',
	"sap/ui/core/Fragment",
	"sap/m/MessageBox"
], function (BaseController, Fragment, MessageBox) {
	"use strict";
	return BaseController.extend("hyperdriver.controller.Workflows", {

		onInit: function () {
			this.getView().setModel(new sap.ui.model.json.JSONModel());
			this._model = this.getView().getModel();
			this.getRouter().getRoute("workflows").attachPatternMatched(this._onWorkflowsMatched, this);
		},

		_onWorkflowsMatched : function (evt) {
			this._model.setProperty("/projectName", evt.getParameter("arguments").projectName);
			evt.getParameter("name") === "workflows" && this.loadWorkflows();
		},

		onWorkflowAction: function (oEv) {
			let sAction = oEv.getParameter("item").data("action");
			let sId = oEv.getParameter("item").data("id");

			switch (sAction) {
				case "run":
					WorkflowRepository.runWorkflow(parseInt(sId));
					break;
				case "updateActiveStatus":
					WorkflowRepository.updateWorkflowActiveState(
						sId, {isActive: !oEv.getParameter("item").data("isActive")}
					);
					this.loadWorkflows();
					break;
				case "edit":
					this.getRouter().navTo("upsertWorkflow", {id: sId});
					break;
				case "delete":
					this.createConfirmDeleteWorkflowDialog(sId);
					break;
			}
		},

		onCreateWorkflow: function () {
			this.getRouter().navTo("upsertWorkflow");
		},

		loadWorkflows: function () {
			let projectName = this._model.getProperty("/projectName");
			WorkflowRepository.getWorkflowsByProjectName(projectName, this._model);
		},

		createConfirmDeleteWorkflowDialog: function (id) {
			MessageBox.confirm("Are you sure you want to delete workflow ?", {
				icon: MessageBox.Icon.WARNING,
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				onClose: function (oResponse) {
					if (oResponse === sap.m.MessageBox.Action.YES) {
						WorkflowRepository.deleteWorkflow(id);
						this.loadWorkflows()
					}
				}.bind(this)
			});
		},

		onWorkflowsRefresh: function () {
			this.loadWorkflows();
		},

		onBackPress: function () {
			this.myNavBack("workflowsByProject");
		}

	});
});