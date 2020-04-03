import {Component, Input, OnInit} from '@angular/core';
import {WorkflowJoinedModel} from "../../../../../models/workflowJoined.model";
import {workflowModes} from "../../../../../models/enums/workflowModes.constants";

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit {
  @Input('mode') mode: string;
  @Input('workflow') workflow: WorkflowJoinedModel;

  workflowModes = workflowModes;

  constructor() { }

  ngOnInit(): void {
  }

}
