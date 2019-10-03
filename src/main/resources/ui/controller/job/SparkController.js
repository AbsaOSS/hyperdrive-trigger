class SparkController {

    constructor(model) {
        this._model = model;
    }

    onShow() {}

    onDeleteAppArgument(oEv) {
        UiListMethods.deleteListItem("/newJob/job/jobParameters/maps/appArguments", this._model, oEv)
    }

    onAddAppArgument() {
        UiListMethods.addListItem("/newJob/job/jobParameters/maps/appArguments", this._model, "");
    }

}