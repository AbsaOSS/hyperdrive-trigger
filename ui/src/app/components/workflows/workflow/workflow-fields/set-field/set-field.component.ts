import {AfterViewChecked, Component, Input, OnChanges, OnInit} from '@angular/core';
import {Subject} from "rxjs";

@Component({
  selector: 'app-set-field',
  templateUrl: './set-field.component.html',
  styleUrls: ['./set-field.component.scss']
})
export class SetFieldComponent implements OnInit {

  @Input() isShow: boolean;
  @Input() fieldName: string;
  @Input() value: string[];
  @Input() property: string;
  @Input() modelChanges: Subject<{property: string, value: any}>;

  constructor() { }

  ngOnInit(): void { }

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
    this.modelChanges.next({property: this.property, value: this.value});
  }

}
