import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {WorkflowJoinedModel} from "../../../../../models/workflowJoined.model";
import {JobDefinitionModel} from "../../../../../models/jobDefinition.model";
import {Subject, Subscription} from "rxjs";
import {distinctUntilChanged} from "rxjs/operators";
import {WorkflowActionChanged} from "../../../../../stores/workflows/workflows.actions";
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import {workflowModes} from "../../../../../models/enums/workflowModes.constants";
import {ComponentModel} from "../../../../../models/workflowComponents.model";

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss']
})
export class JobComponent implements OnInit, AfterViewInit {
  @Input('mode') mode: string;
  @Input('jobId') jobId: number;
  @Input() modelChanges: Subject<{job: JobDefinitionModel, id: number}>;
  @Input() jobDefintion: JobDefinitionModel;
  @Input() jobComponents: ComponentModel[];

  //
  workflowModes = workflowModes;
  selectedJob: ComponentModel;

  modelChanges2: Subject<{property: string, value: any}> = new Subject<{property: string, value: any}>();
  modelSubscription2: Subscription;
  options: string[];

  constructor() { }

  ngOnInit(): void {
    this.selectedJob = this.jobComponents.find(asd => {return asd.name == this.jobDefintion.jobType.name});
    this.options = this.jobComponents.map(asd => {return asd.name});
  }

  ngAfterViewInit(): void {
    this.modelSubscription2 = this.modelChanges2.pipe(
      distinctUntilChanged()
    ).subscribe(newValue => {
      let w: JobDefinitionModel = cloneDeep(this.jobDefintion);
      let valueCopy = cloneDeep(newValue.value);

      set(w, newValue.property, valueCopy);

      this.modelChanges.next({job: w, id: this.jobId})
    });
  }

}
