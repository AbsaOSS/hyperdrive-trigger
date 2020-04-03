import {Component, Input, OnInit} from '@angular/core';
import {WorkflowJoinedModel} from "../../../../../models/workflowJoined.model";
import {workflowModes} from "../../../../../models/enums/workflowModes.constants";

@Component({
  selector: 'app-kafka',
  templateUrl: './kafka.component.html',
  styleUrls: ['./kafka.component.scss']
})
export class KafkaComponent implements OnInit {
  @Input('mode') mode: string;
  @Input('workflow') workflow: WorkflowJoinedModel;

  workflowModes = workflowModes;

  constructor() { }

  ngOnInit(): void {
  }

}
