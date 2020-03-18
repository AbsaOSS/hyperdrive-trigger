import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {AppState, selectWorkflowState} from "../../../stores/app.reducers";
import {skip} from "rxjs/operators";
import {WorkflowModel} from "../../../models/workflow.model";
import {Store} from "@ngrx/store";

@Component({
  selector: 'app-workflows-home',
  templateUrl: './workflows-home.component.html',
  styleUrls: ['./workflows-home.component.scss']
})
export class WorkflowsHomeComponent implements OnInit, OnDestroy {
  workflowsSubscription: Subscription = null;
  workflows = [];

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.workflowsSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.workflows = state.workflows
    });
  }

  ngOnDestroy(): void {
    this.workflowsSubscription.unsubscribe();
  }

}
