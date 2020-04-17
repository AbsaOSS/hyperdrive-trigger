import {Component, Input, OnInit} from '@angular/core';
import {Subject} from "rxjs";

@Component({
  selector: 'app-select-field',
  templateUrl: './select-field.component.html',
  styleUrls: ['./select-field.component.scss']
})
export class SelectFieldComponent implements OnInit {

  @Input() isShow: boolean;
  @Input() fieldName: string;
  @Input() value: string;
  @Input() options: string[];
  @Input() property: string;
  @Input() valueChanges: Subject<{property: string, value: any}>;

  constructor() { }

  ngOnInit(): void {
    console.log('SelectFieldComponent');
    console.log(this.value);
    if(!this.value || this.value == '') {
      console.log('empty');
      this.value = this.options[0];
      this.modelChanged(this.value)}
  }

  modelChanged(value: any) {
    this.valueChanges.next({property: this.property, value: this.value});
  }

}
