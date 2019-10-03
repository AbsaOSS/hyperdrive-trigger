sap.ui.define([
	'./BaseController'
], function (BaseController) {
	"use strict";
	return BaseController.extend("hyperdriver.controller.Runs", {

		onInit: function () {
			this.getView().setModel(new sap.ui.model.json.JSONModel());
			this._model = this.getView().getModel();
			this.getRouter().attachRouteMatched(this.onViewDisplay, this);
		},

		loadRuns: function () {
			RunRepository.getPerWorkflowStatistics(this._model);
		},

		onViewDisplay : function (evt) {
			evt.getParameter("name") === "runs" && this.loadRuns();
		},

		onRefreshPress: function () {
			this.loadRuns()
		},

		onRunsPress: function (oEvent) {
			this.getRouter().navTo("dagRuns", {
				workflowId: oEvent.getSource().getBindingContext().getProperty("workflowId")
			});

		},

	});
});