sap.ui.define([
	'./BaseController'
], function (BaseController) {
	"use strict";
	return BaseController.extend("hyperdriver.controller.WorkflowsByProject", {

		onInit: function () {
			this.getView().setModel(new sap.ui.model.json.JSONModel());
			this._model = this.getView().getModel();
			this.getRouter().attachRouteMatched(this.onViewDisplay, this);
		},

		loadWorkflowsByProject: function () {
			WorkflowRepository.getProjectsInfo(this._model);
		},

		onViewDisplay : function (evt) {
			evt.getParameter("name") === "workflowsByProject" && this.loadWorkflowsByProject();
		},

		onRefreshPress: function () {
			this.loadWorkflowsByProject()
		},

		onProjectPress: function (oEvent) {
			this.getRouter().navTo("workflows", {
				projectName: oEvent.getSource().getBindingContext().getProperty("projectName")
			});

		},

		onCreateWorkflow: function () {
			this.getRouter().navTo("upsertWorkflow");
		}

	});
});