import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberRangeFilterComponent } from './number-range-filter.component';
import { DagRunModel } from '../../../../models/dagRuns/dagRun.model';

describe('NumberRangeFilterComponent', () => {
  let fixture: ComponentFixture<NumberRangeFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NumberRangeFilterComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberRangeFilterComponent);
  });

  it('should create', () => {
    const underTest = fixture.componentInstance;
    expect(underTest).toBeTruthy();
  });

  describe('accepts', () => {
    it('should accept when it is in the range', () => {
      const underTest = fixture.componentInstance;
      underTest.value = { from: 1, to: 3 };
      underTest.property = 'jobCount';
      const dagRun = new DagRunModel('value', 'projectName', 2, 'Status', new Date(Date.now()), new Date(Date.now()), 0);

      expect(underTest.accepts(dagRun)).toBeTrue();
    });

    it('should accept when it is on edge of the range', () => {
      const underTest = fixture.componentInstance;
      underTest.value = { from: 1, to: 2 };
      underTest.property = 'jobCount';
      const dagRun = new DagRunModel('value', 'projectName', 2, 'Status', new Date(Date.now()), new Date(Date.now()), 0);

      expect(underTest.accepts(dagRun)).toBeTrue();
    });

    it('should not accept when it is not in the range', () => {
      const underTest = fixture.componentInstance;
      underTest.value = { from: 5, to: 8 };
      underTest.property = 'jobCount';
      const dagRun = new DagRunModel('value', 'projectName', 2, 'Status', new Date(Date.now()), new Date(Date.now()), 0);

      expect(underTest.accepts(dagRun)).toBeFalse();
    });
  });
});
