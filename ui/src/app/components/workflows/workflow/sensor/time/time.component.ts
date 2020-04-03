import {Component, Input, OnInit} from '@angular/core';
import {WorkflowJoinedModel} from "../../../../../models/workflowJoined.model";
import {workflowModes} from "../../../../../models/enums/workflowModes.constants";

@Component({
  selector: 'app-time',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.scss']
})
export class TimeComponent implements OnInit {
  @Input('mode') mode: string;
  @Input('workflow') workflow: WorkflowJoinedModel;

  workflowModes = workflowModes;

  constructor() { }

  ngOnInit(): void {
  }

}
