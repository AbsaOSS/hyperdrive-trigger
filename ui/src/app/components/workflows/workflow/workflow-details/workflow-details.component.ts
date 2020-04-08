import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {WorkflowJoinedModel} from "../../../../models/workflowJoined.model";
import {workflowModes} from "../../../../models/enums/workflowModes.constants";
import {Store} from "@ngrx/store";
import {AppState, selectWorkflowState} from "../../../../stores/app.reducers";
import {Subject, Subscription} from "rxjs";
import {SensorModel} from "../../../../models/sensor.model";
import {DagDefinitionJoinedModel} from "../../../../models/dagDefinitionJoined.model";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";

@Component({
  selector: 'app-workflow-details',
  templateUrl: './workflow-details.component.html',
  styleUrls: ['./workflow-details.component.scss']
})
export class WorkflowDetailsComponent implements OnInit {
  mode: string;
  workflow: WorkflowJoinedModel;

  workflowSubscription: Subscription;
  workflowModes = workflowModes;

  @Input() modelChanges: Subject<{property: string, value: any}>;

  // modelChanges: Subject<{property: string, value: any}> = new Subject<{property: string, value: any}>();
  // modelSubscription: Subscription;

  constructor(private store: Store<AppState>) { }

  ngOnInit(): void {
    this.workflowSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.mode = state.workflowAction.mode;
      this.workflow = Object.assign({}, state.workflowAction.actionWorkflow);
    });
  }

  // ngAfterViewInit(): void {
  //   this.modelSubscription = this.modelChanges.pipe(
  //     distinctUntilChanged()
  //   ).subscribe(newValue => {
  //
  //     this.workflow[newValue.property] = newValue.value;
  //     console.log(this.workflow);
  //     console.log('modelChanged');
  //   });
  // }

  // modelChanged(value: any) {
  //   this.modelChanges.next(value);
  // }

}
