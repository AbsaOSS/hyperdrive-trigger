import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {Subject} from "rxjs";

@Component({
  selector: 'app-guid-field',
  templateUrl: './guid-field.component.html',
  styleUrls: ['./guid-field.component.scss']
})
export class GuidFieldComponent implements OnInit, AfterViewInit {

  @Input() isShow: boolean;
  @Input() fieldName: string;
  @Input() value: string;
  @Input() property: string;
  @Input() valueChanges: Subject<{property: string, value: any}>;

  constructor() { }

  ngOnInit(): void {
    if(!this.value)
     this.refreshGuid();
  }

  ngAfterViewInit(): void {
    // if(!this.value)
    //   this.refreshGuid();
  }

  refreshGuid() {
    let newUUID: string = this.getUUID();
    this.modelChanged(newUUID);
  }

  modelChanged(value: string) {
    this.value = value;
    this.valueChanges.next({property: this.property, value: this.value});
  }

  getUUID(): string {
    let dt = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

}
