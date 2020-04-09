import {AfterViewChecked, Component, Input, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import cloneDeep from 'lodash/cloneDeep';

@Component({
  selector: 'app-key-value-field',
  templateUrl: './key-value-field.component.html',
  styleUrls: ['./key-value-field.component.scss']
})
export class KeyValueFieldComponent implements OnInit, AfterViewChecked {
  @Input() isShow: boolean;
  @Input() fieldName: string;
  @Input() value: [String, String][];
  @Input() property: string;
  @Input() modelChanges: Subject<{property: string, value: any}>;

  ngAfterViewChecked(): void {
  }

  ngOnInit(): void {
  }

  trackByFn(index, item) {
    return index;
  }


  onAdd() {
    const clonedValue: [String, String][] = cloneDeep(this.value);
    clonedValue.push(['','']);
    this.modelChanged(clonedValue);
  }

  onDelete(index: number) {
    const clonedValue: [String, String][] = cloneDeep(this.value);
    if(this.value.length === 1) {
      clonedValue[index][0] = '';
      clonedValue[index][1] = '';
    } else {
      clonedValue.splice(index, 1);
    }
    this.modelChanged(clonedValue);
  }

  ngModelChanged(value: string, index: number, key: number) {
    const clonedValue: [String, String][] = cloneDeep(this.value);
    clonedValue[index][key] = value;
    this.modelChanged(clonedValue);
  }


  modelChanged(value: [String, String][]) {
    this.value = value;
    this.modelChanges.next({property: this.property, value: value});
  }

}
