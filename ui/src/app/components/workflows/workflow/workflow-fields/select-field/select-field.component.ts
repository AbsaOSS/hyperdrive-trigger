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
  @Input() modelChanges: Subject<{property: string, value: any}>;

  constructor() { }

  ngOnInit(): void {
    console.log(this.options);
  }

  modelChanged(value: boolean) {
    this.modelChanges.next({property: this.property, value: this.value});
  }

}
