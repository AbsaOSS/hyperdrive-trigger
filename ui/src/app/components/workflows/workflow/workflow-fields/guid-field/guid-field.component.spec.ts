import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuidFieldComponent } from './guid-field.component';

describe('GuidFieldComponent', () => {
  let component: GuidFieldComponent;
  let fixture: ComponentFixture<GuidFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuidFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuidFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
