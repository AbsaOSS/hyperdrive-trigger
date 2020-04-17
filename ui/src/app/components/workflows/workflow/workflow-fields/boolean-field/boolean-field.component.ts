import {Component, Input, OnInit} from '@angular/core';
import {Subject} from "rxjs";

@Component({
  selector: 'app-boolean-field',
  templateUrl: './boolean-field.component.html',
  styleUrls: ['./boolean-field.component.scss']
})
export class BooleanFieldComponent implements OnInit {
  @Input() isShow: boolean;
  @Input() fieldName: string;
  @Input() value: boolean;
  @Input() property: string;
  @Input() valueChanges: Subject<{property: string, value: any}>;

  constructor() { }

  ngOnInit(): void {}

  modelChanged(value: boolean) {
    this.valueChanges.next({property: this.property, value: this.value});
  }

}
