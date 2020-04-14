import {Component, Input, OnInit} from '@angular/core';
import {ComponentModel} from "../../../../models/workflowComponents.model";
import {workflowModes} from "../../../../models/enums/workflowModes.constants";
import {Subject} from "rxjs";
import {WorkflowJoinedModel} from "../../../../models/workflowJoined.model";
import get from 'lodash/get';

@Component({
  selector: 'app-workflow-fields',
  templateUrl: './workflow-fields.component.html',
  styleUrls: ['./workflow-fields.component.scss']
})
export class WorkflowFieldsComponent implements OnInit {

  @Input() isShow: boolean;
  @Input() mode: string;
  @Input() workflowComponent: ComponentModel;
  @Input() modelChanges: Subject<{property: string, value: any}>;
  @Input() workflow: any;

  workflowModes = workflowModes;

  constructor() { }

  ngOnInit(): void {
  }

  getValue(path: string): any {
    return get(this.workflow, path);
  }

}
