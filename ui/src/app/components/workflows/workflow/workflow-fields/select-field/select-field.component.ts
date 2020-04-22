import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {Subject} from "rxjs";

@Component({
  selector: 'app-select-field',
  templateUrl: './select-field.component.html',
  styleUrls: ['./select-field.component.scss']
})
export class SelectFieldComponent implements OnInit,AfterViewInit {

  @Input() isShow: boolean;
  @Input() fieldName: string;
  @Input() value: string;
  @Input() options: string[];
  @Input() property: string;
  @Input() valueChanges: Subject<{property: string, value: any}>;

  constructor() { }

  ngOnInit(): void {
    if(!this.value || this.value == '') {
      this.value = this.options[0];
      this.modelChanged(this.value)}
  }

  ngAfterViewInit(): void {
  }

    modelChanged(value: any) {
    this.valueChanges.next({property: this.property, value: this.value});
  }

}
