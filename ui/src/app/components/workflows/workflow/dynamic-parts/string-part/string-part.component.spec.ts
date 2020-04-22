import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StringPartComponent } from './string-part.component';

describe('StringPartComponent', () => {
  let component: StringPartComponent;
  let fixture: ComponentFixture<StringPartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StringPartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StringPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
