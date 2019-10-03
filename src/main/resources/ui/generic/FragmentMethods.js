let FragmentMethods = new function () {

    let _fragmentController = {};


    this.showFragmentIn = function (controllerName, fragmentName, fragmentLocation, destination, model) {
        let oFragmentController = _fragmentController[fragmentName];
        if (!oFragmentController) {
            let oController = eval("new " + controllerName + "(model)");
            let oFragment = sap.ui.xmlfragment(fragmentName, fragmentLocation + "." + fragmentName, oController);
            oFragmentController = {fragment: oFragment, controller: oController};
            _fragmentController[fragmentName] = oFragmentController;

        }
        destination.removeAllContent();
        oFragmentController.fragment.forEach(oElement =>
            destination.addContent(oElement)
        );
        oFragmentController.controller.onShow();
    };

}();