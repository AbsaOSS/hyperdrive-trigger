import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuidPartComponent } from './guid-part.component';

describe('GuidPartComponent', () => {
  let component: GuidPartComponent;
  let fixture: ComponentFixture<GuidPartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuidPartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuidPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
