sap.ui.define([
	'./BaseController'
], function (BaseController) {
	"use strict";
	return BaseController.extend("hyperdriver.controller.RunsByProject", {

		onInit: function () {
			this.getView().setModel(new sap.ui.model.json.JSONModel());
			this._model = this.getView().getModel();
			this.getRouter().attachRouteMatched(this.onViewDisplay, this);
		},

		loadData: function () {
			RunRepository.getPerProjectStatistics(this._model);
		},

		onViewDisplay : function (evt) {
			evt.getParameter("name") === "runsByProject" && this.loadData();
		},

		onRefreshPress: function () {
			this.loadData()
		},

		onProjectPress: function (oEvent) {
			this.getRouter().navTo("runsByWorkflow", {
				projectName: oEvent.getSource().getBindingContext().getProperty("projectName")
			});
		}

	});
});