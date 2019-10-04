let RunRepository = new function () {

    this.getRuns = function (dagInstanceId, model) {
        WSClient.get(
            "jobInstances?dagInstanceId="+dagInstanceId,
            function(data) {
                model.setProperty("/runs", data);
            },
            function() {
                new sap.m.MessageToast.show("Error while loading runs", {animationDuration: 5000});
            }
        );
    };

    this.getOverallStatistics = function (model) {
        WSClient.get(
            "runs/overallStatistics",
            function(data) {
                model.setProperty("/overallStatistics", data);
            },
            function() {
                new sap.m.MessageToast.show("Error while loading statistics", {animationDuration: 5000});
            }
        );
    };

    this.getPerWorkflowStatistics = function (model) {
        WSClient.get(
            "runs/perWorkflowStatistics",
            function(data) {
                model.setProperty("/runs", data);
            },
            function() {
                new sap.m.MessageToast.show("Error while loading runs", {animationDuration: 5000});
            }
        );
    };

    this.getPerDagStatistics = function (workflowId, model) {
        WSClient.get(
            "runs/perDagStatistics?workflowId="+workflowId,
            function(data) {
                model.setProperty("/perDagStatistics", data);
            },
            function() {
                new sap.m.MessageToast.show("Error while loading per dag statistics", {animationDuration: 5000});
            }
        );
    };
}();