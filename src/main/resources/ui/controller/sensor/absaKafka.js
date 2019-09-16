class absaKafka {
    constructor(model) {
        this._model = model;
    }

    onShow() {
        let path = "/workflow/sensor/properties/matchProperties";
        let matchProperties = this._model.getProperty(path);
        if(!(matchProperties && matchProperties.length === 1 && matchProperties.some(e => e.keyField === 'ingestionToken'))) {
            this._model.setProperty(path, [{"keyField": "ingestionToken", "valueField": this.create_UUID()}])
        }
    }

    onAddServer() {
        UiListMethods.addListItem("/workflow/sensor/properties/settings/maps/servers", this._model, "")
    }

    onDeleteServer(oEv) {
        UiListMethods.deleteListItem("/workflow/sensor/properties/settings/maps/servers", this._model, oEv)
    }

    create_UUID(){
        let dt = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
}