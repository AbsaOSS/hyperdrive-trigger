import {AfterViewChecked, Component, Input, OnChanges, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import cloneDeep from 'lodash/cloneDeep';

@Component({
  selector: 'app-key-value-field',
  templateUrl: './key-value-field.component.html',
  styleUrls: ['./key-value-field.component.scss']
})
export class KeyValueFieldComponent implements OnInit, AfterViewChecked, OnChanges {

  @Input() isShow: boolean;
  @Input() fieldName: string;
  @Input() value: [String, String][];
  @Input() property: string;
  @Input() valueChanges: Subject<{property: string, value: any}>;

  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
    // console.log('Changed', this.value);
    // if(!this.value || this.value.length == 0)
    //   this.modelChanged([['', '']]);
  }

  ngAfterViewChecked(): void {
  }

  ngOnInit(): void {
    console.log('ngOnInit');
    if(!this.value || this.value.length == 0)
      this.modelChanged([['', '']]);
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
    console.log('modelChanged');
    this.value = value;
    this.valueChanges.next({property: this.property, value: value});
  }

}
