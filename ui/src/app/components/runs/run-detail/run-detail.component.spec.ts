import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RunDetailComponent } from './run-detail.component';

describe('RunDetailComponent', () => {
  let component: RunDetailComponent;
  let fixture: ComponentFixture<RunDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RunDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
