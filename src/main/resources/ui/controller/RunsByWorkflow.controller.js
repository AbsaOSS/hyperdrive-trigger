sap.ui.define([
	'./BaseController'
], function (BaseController) {
	"use strict";
	return BaseController.extend("hyperdriver.controller.RunsByWorkflow", {

		onInit: function () {
			this.getView().setModel(new sap.ui.model.json.JSONModel());
			this._model = this.getView().getModel();
			this.getRouter().getRoute("runsByWorkflow").attachPatternMatched(this.onViewDisplay, this);
		},

		loadData: function () {
			let projectName = this._model.getProperty("/projectName");
			RunRepository.getPerWorkflowStatistics(projectName, this._model);
		},

		onViewDisplay : function (evt) {
			this._model.setProperty("/projectName", evt.getParameter("arguments").projectName);
			evt.getParameter("name") === "runsByWorkflow" && this.loadData();
		},

		onRefreshPress: function () {
			this.loadData()
		},

		onBackPress: function () {
			this.myNavBack("runsByProject");
		},

		onWorkflowPress: function (oEvent) {
			this.getRouter().navTo("runsByDag", {
				workflowId: oEvent.getSource().getBindingContext().getProperty("workflowId")
			});

		},

	});
});