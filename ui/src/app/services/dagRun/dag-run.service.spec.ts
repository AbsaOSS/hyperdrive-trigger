import { TestBed } from '@angular/core/testing';

import { DagRunService } from './dag-run.service';

describe('DagRunService', () => {
  let service: DagRunService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DagRunService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
