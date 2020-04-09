import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CronQuartzFieldComponent } from './cron-quartz-field.component';

describe('CronQuartzFieldComponent', () => {
  let component: CronQuartzFieldComponent;
  let fixture: ComponentFixture<CronQuartzFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CronQuartzFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CronQuartzFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
