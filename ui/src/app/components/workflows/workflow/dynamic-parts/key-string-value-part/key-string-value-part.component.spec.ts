import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyStringValuePartComponent } from './key-string-value-part.component';

describe('KeyStringValuePartComponent', () => {
  let component: KeyStringValuePartComponent;
  let fixture: ComponentFixture<KeyStringValuePartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeyStringValuePartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyStringValuePartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
