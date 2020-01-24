/*
 * Copyright 2018 ABSA Group Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

sap.ui.define([
	'./BaseController',
	'sap/m/ActionSheet',
	'sap/m/Button',
	'sap/m/MessageToast',
	'sap/ui/core/syncStyleClass',
	'sap/m/library'
], function(
	BaseController,
	ActionSheet,
	Button,
	MessageToast,
	syncStyleClass
) {
	"use strict";

	return BaseController.extend("hyperdriver.controller.App", {

		onInit: function() {
			this.setEmptyModel();

			let fnSuccessGetUserInfo = (oInfo) => {
				sap.ui.getCore().getModel().setProperty("/userInfo", oInfo);
			};
			AuthRepository.getUserInfo(fnSuccessGetUserInfo);

			this.getRouter().attachBypassed((oEvent) => {
				let userInfo = sap.ui.getCore().getModel().getProperty("/userInfo/username");
				if(!userInfo && oEvent.getParameter("name") !== "login") {
					this.getRouter().navTo("home");
				}
			});

			this.getRouter().attachRouteMatched((oEvent) => {
				let userInfo = sap.ui.getCore().getModel().getProperty("/userInfo/username");
				if(userInfo && oEvent.getParameter("name") === "login") {
					this.myNavBack();
				}
				if(!userInfo && oEvent.getParameter("name") !== "login") {
					this.getRouter().navTo("login");
				}
			});


			this._eventBus = sap.ui.getCore().getEventBus();
			this._eventBus.subscribe("nav", "unauthorized", this._unauthorized, this);
		},

		_unauthorized: function(oEvent) {
			sap.ui.getCore().getModel().setProperty("/userInfo", {});
			localStorage.clear();
			this.getRouter().navTo("login");
		},

		onItemSelect: function(oEvent) {
			this.getRouter().navTo(oEvent.getParameter('item').getKey());
		},

		onFixedItemSelect: function (oEvent) {
			if(oEvent.getParameter('item').getKey() === "git")
				window.open( "https://github.com/AbsaOSS/hyperdrive","_blank");
		},

		onSideNavButtonPress: function() {
			let oToolPage = this.byId("app");
			oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
		},

		onUserNamePress: function(oEvent) {
			let userMessageActionSheet = this.byId("userMessageActionSheet");
			if(userMessageActionSheet && userMessageActionSheet.isOpen())	{
				userMessageActionSheet.destroy()
			} else {
				let fnLogout = (oEvent) => {
					this.setEmptyModel();
					AuthRepository.logout();
					localStorage.clear();
					this.getRouter().navTo("login");
				};
				let oActionSheet = new ActionSheet(this.getView().createId("userMessageActionSheet"), {
					title: "Title",
					showCancelButton: false,
					buttons: [
						new Button({
							text: 'Logout',
							type: sap.m.ButtonType.Transparent,
							press: fnLogout
						})
					],
					afterClose: function () {
						oActionSheet.destroy();
					}
				});
				// forward compact/cozy style into dialog
				syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), oActionSheet);
				oActionSheet.openBy(oEvent.getSource());
			}
		},

		setEmptyModel: function() {
			sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel());
			this.getView().setModel(sap.ui.getCore().getModel());
		}

	});
});