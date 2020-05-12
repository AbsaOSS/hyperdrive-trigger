import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { CronQuartzPartComponent } from './cron-quartz-part.component';
import { cronExpressionOptions } from '../../../../../constants/cronExpressionOptions.constants';
import { WorkflowEntryModel } from '../../../../../models/workflowEntry.model';

fdescribe('CronQuartzPartComponent', () => {
  let component: CronQuartzPartComponent;
  let fixture: ComponentFixture<CronQuartzPartComponent>;
  const frequencies = cronExpressionOptions.FREQUENCIES;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CronQuartzPartComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CronQuartzPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set cron for every minutes', () => {
    const underTest = fixture.componentInstance;
    underTest.valueChanges = new Subject<WorkflowEntryModel>();
    const minuteValue = 10;
    const expectedMinuteCron = ['0', '0/10', '0', '?', '*', '*', '*'];
    underTest.setCron(minuteValue, frequencies[0].label);

    expect((underTest.cron).join(' ')).toEqual(expectedMinuteCron.join(' '));
  });

  it('should set cron for every hour', () => {
    const underTest = fixture.componentInstance;
    underTest.valueChanges = new Subject<WorkflowEntryModel>();
    const hourValue = 20;
    const expectedHourCron = ['0', '20', '0', '?', '*', '*', '*'];
    underTest.setCron(hourValue, frequencies[1].label);

    expect((underTest.cron).join(' ')).toEqual(expectedHourCron.join(' '));
  });

  it('should set cron for every day', () => {
    const underTest = fixture.componentInstance;
    underTest.valueChanges = new Subject<WorkflowEntryModel>();
    const dayValue = 30;
    const expectedDayCron = ['0', '0', '30', '?', '*', '*', '*'];
    underTest.setCron(dayValue, frequencies[2].label);

    expect((underTest.cron).join(' ')).toEqual(expectedDayCron.join(' '));
  });

  it('should set cron for to default midnight', () => {
    const underTest = fixture.componentInstance;
    underTest.valueChanges = new Subject<WorkflowEntryModel>();
    const anyValue = 20;
    const expectedDefaultCron = ['0', '0', '0', '?', '*', '*', '*'];
    underTest.setCron(anyValue, 'default');

    expect((underTest.cron).join(' ')).toEqual(expectedDefaultCron.join(' '));
  });

});
