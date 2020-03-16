import {Component, Input, OnInit} from '@angular/core';
import {JobRunModel} from "../../../models/dagRunDetail.model";
import {ClrDatagridStateInterface} from "@clr/angular";
import {DagRunService} from "../../../services/dagRun/dag-run.service";
import {jobStatuses} from"../../../models/enums/jobStatuses.constants";

@Component({
  selector: 'app-run-detail',
  templateUrl: './run-detail.component.html',
  styleUrls: ['./run-detail.component.scss']
})
export class RunDetailComponent implements OnInit {
  @Input('dagRunId') dagRunId: string;
  jobsRun: JobRunModel[];
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
        this.jobsRun = result;
        this.loading = false;
      }
    );
  }
}

