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