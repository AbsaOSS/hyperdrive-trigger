import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {WorkflowJoinedModel} from "../../../../models/workflowJoined.model";
import {jobTypes} from "../../../../models/enums/jobTypes.constants";
import {workflowModes} from "../../../../models/enums/workflowModes.constants";
import {Subject, Subscription} from "rxjs";
import {JobDefinitionModel} from "../../../../models/jobDefinition.model";
import {AppState, selectWorkflowState} from "../../../../stores/app.reducers";
import {Store} from "@ngrx/store";
import {ComponentModel} from "../../../../models/workflowComponents.model";
import {distinctUntilChanged} from "rxjs/operators";
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import {WorkflowActionChanged} from "../../../../stores/workflows/workflows.actions";

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit, AfterViewInit {
  @Input('mode') mode: string;
  @Input('workflow') workflow: WorkflowJoinedModel;

  hiddenJobs: {order: number, isHidden: boolean}[] = [];
  workflowModes = workflowModes;
  jobTypes = jobTypes;

  workflowSubscription: Subscription;

  modelChanges: Subject<{job: JobDefinitionModel, id: number}> = new Subject<{job: JobDefinitionModel, id: number}>();
  modelSubscription: Subscription;

  jobComponents: ComponentModel[];

  constructor(private store: Store<AppState>) { }

  ngOnInit(): void {
    this.workflowSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
       this.jobComponents = state.workflowComponents.jobComponents;
    });
  }

  ngAfterViewInit(): void {
    this.modelSubscription = this.modelChanges.pipe(
      distinctUntilChanged()
    ).subscribe(newValue => {
      let w: WorkflowJoinedModel = cloneDeep(this.workflow);
      let valueCopy = cloneDeep(newValue.job);

      w.dagDefinitionJoined.jobDefinitions[newValue.id] = valueCopy;
      this.store.dispatch(new WorkflowActionChanged(w));
    });
  }

  hideJob(order: number) {
    this.hiddenJobs.some(asd => {return asd.order == order}) ?
      this.hiddenJobs.find(asd => {return asd.order === order}).isHidden = !this.hiddenJobs.find(asd => {return asd.order == order}).isHidden:
      this.hiddenJobs.push({order: order, isHidden: false});
  }

  isHidden(order: number): boolean {
    let isHiddne = this.hiddenJobs.find(asd => {return asd.order === order}) ? this.hiddenJobs.find(asd => {return asd.order === order}).isHidden : true;
    return !isHiddne
  }
}
