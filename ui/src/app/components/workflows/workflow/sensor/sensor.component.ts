import {Component, Input, OnInit} from '@angular/core';
import {WorkflowJoinedModel} from "../../../../models/workflowJoined.model";
import {workflowModes} from "../../../../models/enums/workflowModes.constants";
import {sensorTypes} from "../../../../models/enums/sensorTypes.constants";
import {Store} from "@ngrx/store";
import {AppState, selectWorkflowState} from "../../../../stores/app.reducers";
import {Subject, Subscription} from "rxjs";
import {SensorTypeModel, SensorTypesModel} from "../../../../models/sensorTypes.model";

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.scss']
})
export class SensorComponent implements OnInit {
  @Input('mode') mode: string;
  @Input('workflow') workflow: WorkflowJoinedModel;

  workflowModes = workflowModes;
  sensorTypes: SensorTypesModel;
  options: string[];
  selectedSensor: SensorTypeModel;

  workflowSubscription: Subscription;
  @Input() modelChanges: Subject<{property: string, value: any}>;

  constructor(private store: Store<AppState>) { }

  ngOnInit(): void {
    this.workflowSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.mode = state.workflowAction.mode;
      this.workflow = Object.assign({}, state.workflowAction.actionWorkflow);
      this.sensorTypes = state.sensorTypes;
      this.options = state.sensorTypes.sensorTypes.map(asd => {return asd.name});
      this.selectedSensor = state.sensorTypes.sensorTypes.find(asd => {return asd.name == this.workflow.sensor.sensorType.name})
    });

  }

  select() {
    console.log('select');
  }

}
