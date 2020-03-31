import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {StatusFilterComponent} from './status-filter.component';
import {DagRunModel} from '../../../../models/dagRuns/dagRun.model';

describe('StatusFilterComponent', () => {
  let fixture: ComponentFixture<StatusFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusFilterComponent);
  });

  it('should create', () => {
    const underTest = fixture.componentInstance;
    expect(underTest).toBeTruthy();
  });

  describe('accepts', () => {
    it('should accept on exact match', () => {
      const underTest = fixture.componentInstance;
      underTest.value = 'value';
      underTest.property = 'status';
      const dagRun = new DagRunModel(
        'workflowName', 'projectName', 2, 'value', new Date(Date.now()), new Date(Date.now()), 0
      );

      expect(underTest.accepts(dagRun)).toBeTrue();
    });

    it('should not accept on partial match', () => {
      const underTest = fixture.componentInstance;
      underTest.value = 'alu';
      underTest.property = 'status';
      const dagRun = new DagRunModel(
        'workflowName', 'projectName', 2, 'value', new Date(Date.now()), new Date(Date.now()), 0
      );

      expect(underTest.accepts(dagRun)).toBeFalse();
    });

    it('should not accept on no match', () => {
      const underTest = fixture.componentInstance;
      underTest.value = 'differentValue';
      underTest.property = 'status';
      const dagRun = new DagRunModel(
        'workflowName', 'projectName', 2, 'value', new Date(Date.now()), new Date(Date.now()), 0
      );

      expect(underTest.accepts(dagRun)).toBeFalse();
    });

    it('should accept on empty filter value', () => {
      const underTest = fixture.componentInstance;
      underTest.value = undefined;
      underTest.property = 'status';
      const dagRun = new DagRunModel(
        'workflowName', 'projectName', 2, 'value', new Date(Date.now()), new Date(Date.now()), 0
      );

      expect(underTest.accepts(dagRun)).toBeTrue();
    });
  });
});
