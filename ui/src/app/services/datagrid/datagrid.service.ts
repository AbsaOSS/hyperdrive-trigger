import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatagridService {
  private workflowFilter = new BehaviorSubject(undefined);
  private projectFilter = new BehaviorSubject(undefined);

  constructor() {
    // do nothing
  }

  getWorkflowFilter(): Observable<string> {
    return this.workflowFilter.asObservable();
  }

  getProjectFilter(): Observable<string> {
    return this.projectFilter.asObservable();
  }

  setWorkflowFilter(workflowName: string) {
    this.workflowFilter.next(workflowName);
  }

  setProjectFilter(projectName: string) {
    this.projectFilter.next(projectName);
  }
}
