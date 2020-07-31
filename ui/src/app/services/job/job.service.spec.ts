import { TestBed } from '@angular/core/testing';

import { JobService } from './job.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { api } from '../../constants/api.constants';
import { JobForRunModel, JobForRunModelFactory } from '../../models/jobForRun.model';

describe('JobService', () => {
  let underTest: JobService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JobService],
      imports: [HttpClientTestingModule],
    });
    underTest = TestBed.inject(JobService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(underTest).toBeTruthy();
  });

  it('getJobsForRun() should return jobs for run', () => {
    const workflowId = 1;
    const jobsForRunModel: JobForRunModel[] = [JobForRunModelFactory.create('one', 1, 1), JobForRunModelFactory.create('two', 2, 2)];

    underTest.getJobsForRun(workflowId).subscribe(
      (data) => expect(data).toEqual(jobsForRunModel),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.GET_JOBS_FOR_RUN + `?workflowId=${workflowId}`);
    expect(req.request.method).toEqual('GET');
    req.flush(jobsForRunModel);
  });
});
