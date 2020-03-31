import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleStatusFilterComponent } from './multiple-status-filter.component';

describe('MultipleStatusFilterComponent', () => {
  let component: MultipleStatusFilterComponent;
  let fixture: ComponentFixture<MultipleStatusFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultipleStatusFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleStatusFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
