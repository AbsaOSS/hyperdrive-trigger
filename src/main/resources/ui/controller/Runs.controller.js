sap.ui.define([
	'./BaseController'
], function (BaseController) {
	"use strict";
	return BaseController.extend("hyperdriver.controller.Runs", {

		onInit: function () {
			this.getView().setModel(new sap.ui.model.json.JSONModel());
			this._model = this.getView().getModel();
			this.getRouter().getRoute("runs").attachPatternMatched(this.onViewDisplay, this);
		},

		loadData: function () {
			RunRepository.getRuns(this._model.getProperty("/dagId"), this._model);
		},

		onRunsRefresh: function () {
			this.loadData()
		},

		onBackPress: function () {
			this.myNavBack("runsByDag");
		},

		onViewDisplay: function (oEvent) {
			this._model.setProperty("/dagId", oEvent.getParameter("arguments").dagId);
			this.loadData();
		}

	});
});