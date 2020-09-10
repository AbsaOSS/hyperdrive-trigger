import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryDetailComponent } from './history-detail.component';

describe('HistoryDetailComponent', () => {
  let underTest: HistoryDetailComponent;
  let fixture: ComponentFixture<HistoryDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HistoryDetailComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryDetailComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it('toggleHistoryDetailAccordion() should toggle a history detail', async(() => {
    expect(underTest.isHistoryDetailHidden).toBeFalsy();
    underTest.toggleHistoryDetailAccordion();
    expect(underTest.isHistoryDetailHidden).toBeTruthy();
    underTest.toggleHistoryDetailAccordion();
    expect(underTest.isHistoryDetailHidden).toBeFalsy();
  }));
});
