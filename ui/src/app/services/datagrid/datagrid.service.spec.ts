import { TestBed } from '@angular/core/testing';

import { DatagridService } from './datagrid.service';

describe('DatagridService', () => {
  let service: DatagridService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatagridService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
