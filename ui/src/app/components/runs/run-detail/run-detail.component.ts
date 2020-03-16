import {Component, Input, OnInit} from '@angular/core';
import {ClrDatagridStateInterface} from "@clr/angular";
import {DagRunService} from "../../../services/dagRun/dag-run.service";
import {jobStatuses} from"../../../models/enums/jobStatuses.constants";
import {JobInstanceModel} from "../../../models/jobInstance.model";

@Component({
  selector: 'app-run-detail',
  templateUrl: './run-detail.component.html',
  styleUrls: ['./run-detail.component.scss']
})
export class RunDetailComponent implements OnInit {
  @Input('dagRunId') dagRunId: string;
  jobInstances: JobInstanceModel[];
  loading: boolean = true;

  jobStatuses = jobStatuses;

  constructor(private dagRunService: DagRunService) {
  }

  ngOnInit() {
    console.log(this.dagRunId);
  }

  refresh(state: ClrDatagridStateInterface) {
    this.loading = true;
    this.dagRunService.getDagRunDetails(this.dagRunId).then(
      (result) => {
        this.jobInstances = result;
        this.loading = false;
      }
    );
  }
}

