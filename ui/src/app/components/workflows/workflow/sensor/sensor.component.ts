import {Component, Input, OnInit} from '@angular/core';
import {WorkflowJoinedModel} from "../../../../models/workflowJoined.model";
import {workflowModes} from "../../../../models/enums/workflowModes.constants";
import {sensorTypes} from "../../../../models/enums/sensorTypes.constants";

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.scss']
})
export class SensorComponent implements OnInit {
  @Input('mode') mode: string;
  @Input('workflow') workflow: WorkflowJoinedModel;

  workflowModes = workflowModes;
  sensorTypes = sensorTypes;

  constructor() { }

  ngOnInit(): void {
    console.log('ngOnInit');
  }

  select() {
    console.log('select');
  }

}
