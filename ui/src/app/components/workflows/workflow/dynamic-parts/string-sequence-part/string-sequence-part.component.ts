import {Component, Input, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import {WorkflowEntryModel} from "../../../../../models/workflowEntry.model";

@Component({
  selector: 'app-string-sequence-part',
  templateUrl: './string-sequence-part.component.html',
  styleUrls: ['./string-sequence-part.component.scss']
})
export class StringSequencePartComponent implements OnInit {

  @Input() isShow: boolean;
  @Input() name: string;
  @Input() value: string[];
  @Input() property: string;
  @Input() valueChanges: Subject<WorkflowEntryModel>;

  constructor() {
  }

  ngOnInit(): void {
    if (!this.value)
      this.modelChanged([''])
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
    this.valueChanges.next(new WorkflowEntryModel(this.property, this.value));
  }

}
