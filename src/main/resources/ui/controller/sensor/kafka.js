class kafka {
    constructor(model) {
        this._model = model;
    }

    onShow() {}

    onDeleteServer(oEv) {
        UiListMethods.deleteListItem("/workflow/sensor/sensorProperties/properties/maps/servers", this._model, oEv)
    }

    onDeleteMatchProperty(oEv) {
        UiListMethods.deleteListItem("/workflow/sensor/sensorProperties/matchProperties", this._model, oEv)
    }

    onAddMatchProperty() {
        UiListMethods.addListItem( "/workflow/sensor/sensorProperties/matchProperties", this._model, {"keyField": "", "valueField": ""})
    }

    onAddServer() {
        UiListMethods.addListItem("/workflow/sensor/sensorProperties/properties/maps/servers", this._model, "")
    }

}