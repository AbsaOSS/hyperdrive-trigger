sap.ui.define([
    './BaseController'
], function (BaseController) {
    "use strict";
    return BaseController.extend("hyperdriver.controller.RunsByDag", {

        onInit: function () {
            this.getView().setModel(new sap.ui.model.json.JSONModel());
            this._model = this.getView().getModel();
            this.getRouter().getRoute("runsByDag").attachPatternMatched(this.onViewDisplay, this);
        },

        onDagPress: function (oEvent) {
            this.getRouter().navTo("runs", {
                dagId: oEvent.getSource().getBindingContext().getProperty("dagId")
            });
        },

        onRefreshPress: function () {
            this.loadData()
        },

        onBackPress: function () {
            this.myNavBack("runsByWorkflow");
        },

        loadData: function () {
            RunRepository.getPerDagStatistics(this._model.getProperty("/workflowId"), this._model);
        },

        onViewDisplay: function (oEvent) {
            this._model.setProperty("/workflowId", oEvent.getParameter("arguments").workflowId);
            this.loadData();
        }

    });
});