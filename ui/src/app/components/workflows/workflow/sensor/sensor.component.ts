import {Component, Input, OnInit} from '@angular/core';
import {WorkflowJoinedModel} from "../../../../models/workflowJoined.model";
import {workflowModes} from "../../../../models/enums/workflowModes.constants";
import {Store} from "@ngrx/store";
import {AppState, selectWorkflowState} from "../../../../stores/app.reducers";
import {Subject, Subscription} from "rxjs";
import cloneDeep from 'lodash/cloneDeep';
import {ComponentModel} from "../../../../models/workflowComponents.model";

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.scss']
})
export class SensorComponent implements OnInit {
  @Input('mode') mode: string;
  @Input('workflow') workflow: WorkflowJoinedModel;

  workflowModes = workflowModes;
  sensorComponents: ComponentModel[];
  options: string[];
  selectedSensor: ComponentModel;

  workflowSubscription: Subscription;
  @Input() modelChanges: Subject<{property: string, value: any}>;

  constructor(private store: Store<AppState>) { }

  ngOnInit(): void {
    this.workflowSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.mode = state.workflowAction.mode;
      this.workflow = cloneDeep(state.workflowAction.actionWorkflow);//Object.assign({}, state.workflowAction.actionWorkflow);
      this.sensorComponents = state.workflowComponents.sensorComponents;
      this.options = state.workflowComponents.sensorComponents.map(asd => {return asd.name});
      this.selectedSensor = state.workflowComponents.sensorComponents.find(asd => {return asd.name == this.workflow.sensor.sensorType.name})

    });

  }

}
