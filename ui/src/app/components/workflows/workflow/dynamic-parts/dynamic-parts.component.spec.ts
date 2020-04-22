import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicPartsComponent } from './dynamic-parts.component';

describe('DynamicPartsComponent', () => {
  let component: DynamicPartsComponent;
  let fixture: ComponentFixture<DynamicPartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicPartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicPartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
