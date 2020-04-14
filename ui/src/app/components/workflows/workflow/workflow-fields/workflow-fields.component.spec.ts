import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowFieldsComponent } from './workflow-fields.component';

describe('WorkflowFieldsComponent', () => {
  let component: WorkflowFieldsComponent;
  let fixture: ComponentFixture<WorkflowFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
