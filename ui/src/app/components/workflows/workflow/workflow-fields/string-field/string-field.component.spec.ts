import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StringFieldComponent } from './string-field.component';

describe('StringFieldComponent', () => {
  let component: StringFieldComponent;
  let fixture: ComponentFixture<StringFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StringFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StringFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
