import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {Subject} from "rxjs";

@Component({
  selector: 'app-set-field',
  templateUrl: './set-field.component.html',
  styleUrls: ['./set-field.component.scss']
})
export class SetFieldComponent implements OnInit, AfterViewInit {

  @Input() isShow: boolean;
  @Input() fieldName: string;
  @Input() value: string[];
  @Input() property: string;
  @Input() valueChanges: Subject<{ property: string, value: any }>;

  constructor() {
  }

  ngOnInit(): void {
    if (!this.value)
      this.modelChanged([''])
  }

  ngAfterViewInit(): void {
    // if (!this.value)
    //   this.modelChanged([''])
  }

  trackByFn(index, item) {
    return index;
  }

  onDeleteServer(index: number) {
    const clonedValue  = Object.assign([], this.value);
    this.value.length === 1 ? clonedValue[0] = '' : clonedValue.splice(index, 1);
    this.modelChanged(clonedValue);
  }

  onServerAdd() {
    const clonedValue  = Object.assign([], this.value);
    clonedValue.push('');
    this.modelChanged(clonedValue);
  }

  ngModelChanged(value: string, id: number) {
    const clonedValue  = Object.assign([], this.value);
    clonedValue[id] = value;
    this.modelChanged(clonedValue);
  }

  modelChanged(value: string[]) {
    this.value = value;
    this.valueChanges.next({property: this.property, value: this.value});
  }

}
