import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPartComponent } from './select-part.component';

describe('SelectPartComponent', () => {
  let component: SelectPartComponent;
  let fixture: ComponentFixture<SelectPartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectPartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
