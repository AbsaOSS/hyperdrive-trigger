import {Component, Input, OnInit} from '@angular/core';
import {WorkflowJoinedModel} from "../../../../../models/workflowJoined.model";
import {workflowModes} from "../../../../../models/enums/workflowModes.constants";

@Component({
  selector: 'app-absa-kafka',
  templateUrl: './absa-kafka.component.html',
  styleUrls: ['./absa-kafka.component.scss']
})
export class AbsaKafkaComponent implements OnInit {
  @Input('mode') mode: string;
  @Input('workflow') workflow: WorkflowJoinedModel;

  workflowModes = workflowModes;

  constructor() { }

  ngOnInit(): void {
  }

}
