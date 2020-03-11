import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RunDetailComponent } from './run-detail.component';
import {MockStore, provideMockStore} from "@ngrx/store/testing";
import * as fromApp from "../../../stores/app.reducers";
import {DagRunService} from "../../../services/dagRun/dag-run.service";
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('RunDetailComponent', () => {
  let component: RunDetailComponent;
  let fixture: ComponentFixture<RunDetailComponent>;
  let mockStore: MockStore<fromApp.AppState>;
  let dagRunService: DagRunService;

  const initialAppState = {
    auth: {},
    runs: {}
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState: initialAppState })
      ],
      declarations: [ RunDetailComponent ],
      imports: [ HttpClientTestingModule ]
    }).compileComponents();
    dagRunService = TestBed.inject(DagRunService);

  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
