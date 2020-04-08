import {Component, Input, OnInit} from '@angular/core';
import {Subject} from "rxjs";

@Component({
  selector: 'app-string-field',
  templateUrl: './string-field.component.html',
  styleUrls: ['./string-field.component.scss']
})
export class StringFieldComponent implements OnInit {
  @Input() isShow: boolean;
  @Input() fieldName: string;
  @Input() value: string;
  @Input() property: string;
  @Input() modelChanges: Subject<{property: string, value: any}>;

  constructor() { }

  ngOnInit(): void {}

  modelChanged(value: string) {
    this.modelChanges.next({property: this.property, value: this.value});
  }

}
