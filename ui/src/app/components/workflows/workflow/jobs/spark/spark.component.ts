import {Component, Input, OnInit} from '@angular/core';
import {WorkflowJoinedModel} from "../../../../../models/workflowJoined.model";
import {workflowModes} from "../../../../../models/enums/workflowModes.constants";

@Component({
  selector: 'app-spark',
  templateUrl: './spark.component.html',
  styleUrls: ['./spark.component.scss']
})
export class SparkComponent implements OnInit {
  @Input('mode') mode: string;
  @Input('workflow') workflow: WorkflowJoinedModel;

  workflowModes = workflowModes;

  constructor() { }

  ngOnInit(): void {
  }

}
