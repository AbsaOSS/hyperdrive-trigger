sap.ui.define([
	'./BaseController'
], function (BaseController) {
	"use strict";
	return BaseController.extend("hyperdriver.controller.WorkflowRuns", {

		onInit: function () {
			this.getView().setModel(new sap.ui.model.json.JSONModel());
			this._model = this.getView().getModel();
			this.getRouter().getRoute("workflowRuns").attachPatternMatched(this._onRunsMatched, this);
		},

		loadRuns: function () {
			RunRepository.getRuns(this._model.getProperty("/dagId"), this._model);
		},

		onRunsRefresh: function () {
			this.loadRuns()
		},

		onBackPress: function () {
			this.myNavBack("runs");
		},

		_onRunsMatched: function (oEvent) {
			this._model.setProperty("/dagId", oEvent.getParameter("arguments").dagId);
			this.loadRuns();
		}

	});
});