import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetFieldComponent } from './set-field.component';

describe('SetFieldComponent', () => {
  let component: SetFieldComponent;
  let fixture: ComponentFixture<SetFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
