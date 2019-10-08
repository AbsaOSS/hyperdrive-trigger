sap.ui.define([
	'./BaseController',
	"sap/ui/core/Fragment",
	'sap/ui/model/Filter'
], function (BaseController, Fragment, Filter) {
	"use strict";
	return BaseController.extend("hyperdriver.controller.UpsertWorkflow", {

		onInit: function () {
			this.getRouter().attachRouteMatched(this.onViewDisplay, this);
			this.getView().setModel(new sap.ui.model.json.JSONModel());
			this._model = this.getView().getModel();

			this._emptySensorProperties = {
				settings: {
					variables: {},
					maps: {}
				},
				matchProperties: []
			};
			this._emptyWorkflow = {
				isActive: false,
				sensor: {
					sensorType: {
						name: "Absa-Kafka"
					},
					properties: { ...this._emptySensorProperties }
				}
			};

			let cont = new JobController(this);
			let view = this.getView();
			this._upsertJobDialog = Fragment.load({
				id: view.getId(),
				name: "hyperdriver.view.job.job",
				controller: cont
			}).then(function (fragment) {
				view.addDependent(fragment);
			});
			this._upsertJobDialog = this.byId("jobDialog");
		},

		onViewDisplay : function (evt) {
			if(evt.getParameter("name") === "upsertWorkflow") {
				let id = evt.getParameter("arguments").id;
				let isEdit = !!id;
				this._model.setProperty("/id", id);
				this._model.setProperty("/isEdit", isEdit);

				isEdit ? this.initEditDialog() : this.initCreateDialog();
				this._model.setProperty("/sensorTypes", this.sensorTypes);
			}
		},

		initEditDialog: function () {
			this._model.setProperty("/title", "Update");
			WorkflowRepository.getWorkflow(this._model.getProperty("/id"), this._model);
			WorkflowRepository.getProjects(this._model);
			this.loadViewFragments();
		},

		initCreateDialog: function () {
			this._model.setProperty("/title", "Create");
			this._model.setProperty("/workflow", jQuery.extend(true, {}, this._emptyWorkflow));
			WorkflowRepository.getProjects(this._model);
			this.loadViewFragments();
		},

		onDeleteJob: function (oEv) {
			let order = oEv.getSource().data("order");
			UiListMethods.deleteListItemByOrder("/workflow/dagDefinitionJoined/jobDefinitions", this._model, order);
			let jobs = [];
			this._model.getProperty("/workflow/dagDefinitionJoined/jobDefinitions").forEach(function(e, index) {
				e.order = index;
				jobs.push(e);
			});
			this._model.setProperty("/workflow/dagDefinitionJoined/jobDefinitions", jobs);
		},

		onEditJob: function (oEv) {
			let order = oEv.getSource().data("order");
			this._model.setProperty("/newJob", {title: "Edit", isEdit: true, order: order});
			this._upsertJobDialog.open();
		},

		onAddJob: function () {
			this._model.setProperty("/newJob", {title: "Add", isEdit: false});
			this._upsertJobDialog.open();
		},

		onSaveWorkflow: function () {
			let isEdit = this._model.getProperty("/isEdit");
			let workflow = this.getWorkflowToSave();
			if(isEdit) {
				WorkflowRepository.updateWorkflow(workflow);
			} else {
				WorkflowRepository.createWorkflow(workflow);
			}
			this.myNavBack();
		},

		getWorkflowToSave: function () {
			let workflow = this._model.getProperty("/workflow");
			let matchProperties = {};
			workflow.sensor.properties.matchProperties.map(function(joinCondition) {
				matchProperties[joinCondition.keyField] = joinCondition.valueField
			});
			workflow.sensor.properties.matchProperties = matchProperties;

			return workflow
		},

		loadViewFragments: function () {
			this.onSensorTypeSelect(true);
		},

		onSensorTypeSelect: function (isInitial) {
			isInitial !== true && this._model.setProperty("/workflow/sensor/properties", jQuery.extend(true, {}, this._emptySensorProperties));
			let key = this.getView().byId("sensorTypeSelect").getSelectedKey();
			let fragmentName = this.sensorTypes.find(function(e) { return e.name === key }).fragment;
			let controllerName = this.sensorTypes.find(function(e) { return e.name === key }).controller;
			let oLayout = this.getView().byId("sensorForm");
			FragmentMethods.showFragmentIn(controllerName, fragmentName, "hyperdriver.view.sensor", oLayout, this._model);
		},

		onProjectHelpReq : function (oEvent) {
			let inputValue = oEvent.getSource().getValue();
			this.inputId = oEvent.getSource().getId();

			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"hyperdriver.fragment.workflowProjectSelect",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}

			this._valueHelpDialog.getBinding("items").filter(
				[new Filter("", sap.ui.model.FilterOperator.Contains, inputValue)]
			);
			this._valueHelpDialog.open(inputValue);
		},

		onProjectSearch : function (evt) {
			let value = evt.getParameter("value");
			let filter = new Filter("", sap.ui.model.FilterOperator.Contains, value);
			evt.getSource().getBinding("items").filter([filter]);
		},

		onProjectSearchClose : function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				let projectInput = this.byId(this.inputId);
				let title = oSelectedItem.getTitle();
				projectInput.setSelectedKey(title);
			}
			evt.getSource().getBinding("items").filter([]);
		},

		onBackPress: function () {
			this.myNavBack();
		},

		onCancelWorkflow: function () {
			this.myNavBack();
		},

		tableReorderDrop: function(oEvent) {
			TileMethods.reorderTiles(oEvent, this._model, "/workflow/dagDefinitionJoined/jobDefinitions", this.getView());
		},

		sensorTypes: [
			{name: "Absa-Kafka", fragment: "absaKafka", controller: "AbsaKafkaController"},
			{name: "Kafka", fragment: "kafka", controller: "KafkaController"}
		]

	});
});