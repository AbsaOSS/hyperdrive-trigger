import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { api } from '../../constants/api.constants';
import { map } from 'rxjs/operators';
import { JobForRunModel } from '../../models/jobForRun.model';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  constructor(private httpClient: HttpClient) {}

  getJobsForRun(workflowId: number): Observable<JobForRunModel[]> {
    const params = new HttpParams().set('workflowId', workflowId.toString());

    return this.httpClient
      .get<JobForRunModel[]>(api.GET_JOBS_FOR_RUN, { params: params, observe: 'response' })
      .pipe(map((_) => _.body));
  }
}
