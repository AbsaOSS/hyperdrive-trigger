import {Component, Input, OnInit} from '@angular/core';
import {Subject} from "rxjs";

@Component({
  selector: 'app-key-value-field',
  templateUrl: './key-value-field.component.html',
  styleUrls: ['./key-value-field.component.scss']
})
export class KeyValueFieldComponent implements OnInit {

  @Input() isShow: boolean;
  @Input() fieldName: string;
  @Input() value: Map<String, String>;
  @Input() property: string;
  @Input() modelChanges: Subject<{property: string, value: any}>;

  constructor() { }

  ngOnInit(): void {
    console.log('KeyValueFieldComponent');
    console.log(this.value);
    console.log(this.value.size);

  }

  trackByFn(index, item) {
    return index;
  }

  onDeleteServer(key: string) {
    // this.value.re
    // const clonedValue  = Object.assign({}, this.value);
    // if(this.value.size === 1) {
    //   delete clonedValue[key];
    //   clonedValue[''] = '';
    // } else {
    //   delete clonedValue[key];
    // }
    // this.getValueSize() === 1 ? clonedValue[0] = '' : clonedValue.splice(index, 1);
    // this.modelChanged(clonedValue);
  }

  onServerAdd() {
    // const clonedValue = Object.assign({}, this.value);
    const clonedValue = new Map<string,string>(JSON.parse(JSON.stringify(Array.from(this.value))));

    // const clonedValue = new Map<string, string>(this.value);
    clonedValue.set('aa', 'aa');
    console.log('onServerAdd');
    console.log(clonedValue);
    this.modelChanged(clonedValue);

    // const clonedValue  = Object.assign({}, this.value);
    // clonedValue['']='';
    // clonedValue.push('');
    // this.modelChanged(clonedValue);
  }
  //
  // ngModelChanged(value: string, id: number) {
  //   const clonedValue  = Object.assign([], this.value);
  //   clonedValue[id] = value;
  //   this.modelChanged(clonedValue);
  // }
  //
  modelChanged(value: Map<String, String>) {
    this.value = value;
    console.log('xxxxxxx');
    console.log(this.property);
    console.log(this.value);
    console.log('zzzzzzzz');

    this.modelChanges.next({property: this.property, value: this.value});
  }

}
