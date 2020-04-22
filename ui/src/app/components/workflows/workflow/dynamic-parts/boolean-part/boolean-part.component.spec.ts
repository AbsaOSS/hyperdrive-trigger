import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BooleanPartComponent } from './boolean-part.component';

describe('BooleanPartComponent', () => {
  let component: BooleanPartComponent;
  let fixture: ComponentFixture<BooleanPartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BooleanPartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BooleanPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
