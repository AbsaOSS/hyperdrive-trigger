import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StringSequencePartComponent } from './string-sequence-part.component';

describe('StringSequencePartComponent', () => {
  let component: StringSequencePartComponent;
  let fixture: ComponentFixture<StringSequencePartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StringSequencePartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StringSequencePartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
