import {Component, Input, OnInit} from '@angular/core';
import {WorkflowJoinedModel} from "../../../../models/workflowJoined.model";
import {jobTypes} from "../../../../models/enums/jobTypes.constants";
import {workflowModes} from "../../../../models/enums/workflowModes.constants";

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit {
  @Input('mode') mode: string;
  @Input('workflow') workflow: WorkflowJoinedModel;

  hiddenJobs: {order: number, isHidden: boolean}[] = [];
  workflowModes = workflowModes;
  // sensorTypes = sensorTypes;
  jobTypes = jobTypes;

  constructor() { }

  ngOnInit(): void {
  }

  hideJob(order: number) {
    this.hiddenJobs.some(asd => {return asd.order == order}) ?
      this.hiddenJobs.find(asd => {return asd.order === order}).isHidden = !this.hiddenJobs.find(asd => {return asd.order == order}).isHidden:
      this.hiddenJobs.push({order: order, isHidden: false});
  }

  isHidden(order: number): boolean {
    let isHiddne = this.hiddenJobs.find(asd => {return asd.order === order}) ? this.hiddenJobs.find(asd => {return asd.order === order}).isHidden : true;
    return !isHiddne
  }
}
