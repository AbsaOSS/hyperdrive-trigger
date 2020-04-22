import {Component, Input, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import cloneDeep from 'lodash/cloneDeep';
import {WorkflowEntryModel} from "../../../../../models/workflowEntry.model";

@Component({
  selector: 'app-key-string-value-part',
  templateUrl: './key-string-value-part.component.html',
  styleUrls: ['./key-string-value-part.component.scss']
})
export class KeyStringValuePartComponent implements OnInit {

  @Input() isShow: boolean;
  @Input() name: string;
  @Input() value: [String, String][];
  @Input() property: string;
  @Input() valueChanges: Subject<WorkflowEntryModel>;

  ngOnInit(): void {
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
    this.value = value;
    this.valueChanges.next(new WorkflowEntryModel(this.property, value));
  }

}
