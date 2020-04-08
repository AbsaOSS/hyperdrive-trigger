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
  @Input() modelChanges: Subject<{property: string, value: any}>;

  constructor() { }

  ngOnInit(): void {}

  modelChanged(value: boolean) {
    this.modelChanges.next({property: this.property, value: this.value});
  }

}
