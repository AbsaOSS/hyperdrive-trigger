import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowsHomeComponent } from './workflows-home.component';
import {provideMockStore} from "@ngrx/store/testing";

describe('WorkflowsHomeComponent', () => {
  let component: WorkflowsHomeComponent;
  let fixture: ComponentFixture<WorkflowsHomeComponent>;

  const initialAppState = {
    workflows: {}
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState: initialAppState })
      ],
      declarations: [ WorkflowsHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
