import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberRangeFilterComponent } from './number-range-filter.component';

describe('NumberRangeFilterComponent', () => {
  let component: NumberRangeFilterComponent;
  let fixture: ComponentFixture<NumberRangeFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NumberRangeFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberRangeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
