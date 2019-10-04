class KafkaController {

    constructor(model) {
        this._model = model;
    }

    onShow() {}

    onDeleteServer(oEv) {
        UiListMethods.deleteListItem("/workflow/sensor/properties/settings/maps/servers", this._model, oEv)
    }

    onDeleteMatchProperty(oEv) {
        UiListMethods.deleteListItem("/workflow/sensor/properties/matchProperties", this._model, oEv)
    }

    onAddMatchProperty() {
        UiListMethods.addListItem( "/workflow/sensor/properties/matchProperties", this._model, {"keyField": "", "valueField": ""})
    }

    onAddServer() {
        UiListMethods.addListItem("/workflow/sensor/properties/settings/maps/servers", this._model, "")
    }

}