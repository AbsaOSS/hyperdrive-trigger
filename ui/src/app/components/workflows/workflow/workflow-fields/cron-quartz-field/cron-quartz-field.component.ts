import {AfterViewChecked, Component, Input, OnInit} from '@angular/core';
import {Subject} from "rxjs";

@Component({
  selector: 'app-cron-quartz-field',
  templateUrl: './cron-quartz-field.component.html',
  styleUrls: ['./cron-quartz-field.component.scss']
})
export class CronQuartzFieldComponent implements OnInit, AfterViewChecked {

  @Input() isShow: boolean;
  @Input() fieldName: string;
  @Input() value: string;
  @Input() property: string;
  @Input() valueChanges: Subject<{property: string, value: any}>;

  base;
  dayValue;
  dayOfMonthValue;
  monthValue;
  minuteValue;
  everyHourEvery;
  // hourValue;
  everyHourAt;

  frequencies = [
    {
      value : 1,
      label : 'Hour every'
    },
    {
      value : 2,
      label : 'Hour at'
    },
    {
      value : 3,
      label : 'Day'
    },
    {
      value : 4,
      label : 'Week'
    },
    {
      value : 5,
      label : 'Month'
    },
    {
      value : 6,
      label : 'Year'
    }
  ];
  dayValues = [
    {
      value : 1,
      label : 'Monday'
    },
    {
      value : 2,
      label : 'Tuesday'
    },
    {
      value : 3,
      label : 'Wednesday'
    },
    {
      value : 4,
      label : 'Thursday'
    },
    {
      value : 5,
      label : 'Friday'
    },
    {
      value : 6,
      label : 'Saturday'
    },
    {
      value : 7,
      label : 'Sunday'
    }
  ];
  dayOfMonthValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
  monthValues = [
    {
      value : 1,
      label : 'January'
    },
    {
      value : 2,
      label : 'February'
    },
    {
      value : 3,
      label : 'March'
    },
    {
      value : 4,
      label : 'April'
    },
    {
      value : 5,
      label : 'May'
    },
    {
      value : 6,
      label : 'June'
    },
    {
      value : 7,
      label : 'July'
    },
    {
      value : 8,
      label : 'August'
    },
    {
      value : 9,
      label : 'September'
    },
    {
      value : 10,
      label : 'October'
    },
    {
      value : 11,
      label : 'November'
    },
    {
      value : 12,
      label : 'December'
    }
  ];
  hourValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  minuteValues = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  minutesValues = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  constructor() { }

  ngOnInit(): void {
    this.fromCron(this.value)
  }

  ngAfterViewChecked(): void {
  }

  setCron(n): string {
    var cron = ['0', '*', '*',  '*',  '*', '?'];

    if(n && n.base && n.base >= 2) {
      cron[1] = typeof n.minuteValue !== undefined ? n.minuteValue : '0';
    }

    if(n && n.base && n.base >= 3) {
      cron[2] = typeof n.hourValue !== undefined ? n.hourValue  : '*';
    }

    if(n && n.base && n.base === 4) {
      cron[3] = "?";
      cron[5] = n.dayValue;
    }

    if(n && n.base && n.base >= 5) {
      cron[3] = typeof n.dayOfMonthValue !== undefined ? n.dayOfMonthValue : '?';
    }

    if(n && n.base && n.base === 6) {
      cron[4] = typeof n.monthValue !== undefined ? n.monthValue : '*';
    }
    return cron.join(' ');
  };

  fromCron(value: string) {
    let cron: string[] = value.replace(/\s+/g, ' ').split(' ');
    // var frequency = {base: '1'}; // default: every minute

    if(cron[1] === '*' && cron[2] === '*' && cron[3] === '*' && cron[4] === '*' && cron[5] === '?') {
      this.base = 1; // every minute
    } else if(cron[2] === '*' && cron[3] === '*'  && cron[4] === '*' && cron[5] === '?') {
      this.base = 2; // every hour
    } else if(cron[3] === '*'  && cron[4] === '*' && cron[5] === '?') {
      this.base = 3; // every day
    } else if(cron[3] === '?') {
      this.base = 4; // every week
    } else if(cron[4] === '*' && cron[5] === '?') {
      this.base = 5; // every month
    } else if(cron[5] === '?') {
      this.base = 6; // every year
    }

    // if (cron[1] !== '*') {
    //   this.minuteValue = parseInt(cron[1]);
    // }
    // if (cron[2] !== '*') {
    //   this.hourValue = parseInt(cron[2]);
    // }
    // if (cron[3] !== '*' && cron[3] !== '?') {
    //   this.dayOfMonthValue = parseInt(cron[3]);
    // }
    // if (cron[4] !== '*') {
    //   this.monthValue = parseInt(cron[4]);
    // }
    // if (cron[5] !== '*' && cron[5] !== '?') {
    //   this.dayValue = parseInt(cron[5]);
    // }
    // //
    // frequency.base += ''; // 'cast' to string in order to set proper value on "every" modal
    // //
    // return frequency;
  };

}
