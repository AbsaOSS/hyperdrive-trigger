class JobController {
    constructor(controller) {
        this._controller = controller;
        this._model = this._controller._model;
        this._model.setProperty("/jobTypes", this.jobTypes);
    }

    onBeforeOpen() {
        this._prepareJobData();

        this._dialog = this._controller.byId("jobDialog");
        this._ruleForm = this._controller.byId("jobForm");

        let key = this._model.getProperty("/newJob/job/jobType/name");
        let fragmentName = this.jobTypes.find(function(e) { return e.name === key }).fragment;
        let controllerName = this.jobTypes.find(function(e) { return e.name === key }).controller;
        FragmentMethods.showFragmentIn(controllerName, fragmentName, "hyperdriver.view.job", this._ruleForm, this._model);
    }

    onJobSave() {
        let jobDefinitionsPath = "/workflow/dagDefinitionJoined/jobDefinitions";
        let jobDefinitions = this._model.getProperty(jobDefinitionsPath);

        if (this._model.getProperty("/newJob/isEdit")) {
            this._onEditSave(jobDefinitionsPath, jobDefinitions);
        } else {
            this._onCreateSave(jobDefinitionsPath, jobDefinitions);
        }
        this.onClosePress();
    }

    _onEditSave(jobDefinitionsPath, jobDefinitions) {
        let order = this._model.getProperty("/newJob/job/order");
        let jobs = [];
        let newJob = this._model.getProperty("/newJob/job");
        jobDefinitions.forEach(function (e) {
            if (e.order === order) {
                jobs.push(newJob)
            } else {
                jobs.push(e)
            }
        });
        this._model.setProperty(jobDefinitionsPath, jobs);
    }

    _onCreateSave(jobDefinitionsPath, jobDefinitions) {
        if (!this._model.getProperty("/workflow/dagDefinitionJoined")) {
            this._model.setProperty("/workflow/dagDefinitionJoined", {
                jobDefinitions: []
            });
        }
        jobDefinitions.forEach((element, index) => element.order = index);
        this._model.getProperty("/newJob/job").order = jobDefinitions.length;
        jobDefinitions.push(this._model.getProperty("/newJob/job"));
        this._model.setProperty(jobDefinitionsPath, jobDefinitions);
    }

    _prepareJobData() {
        if (this._model.getProperty("/newJob/isEdit")) {
            let order = this._model.getProperty("/newJob/order");
            let old = this._model.getProperty("/workflow/dagDefinitionJoined/jobDefinitions/"+order);
            this._model.setProperty("/newJob/job", {...$.extend(true, {}, old)})
        } else {
            this._model.setProperty("/newJob/job", {...$.extend(true, {}, this._emptyJob)});
        }
    }

    onClosePress() {
        this._dialog.close();
    }

    jobTypes = [
        {name: "Spark", fragment: "spark", controller: "SparkController"}
    ]

    _emptyJob = {
        jobType: {
            name: "Spark"
        },
        jobParameters: {
            variables: {
                deploymentMode: "cluster"
            },
            maps: {}
        },
        dagDefinitionJoined: {
            jobDefinitions: []
        }
    }

}