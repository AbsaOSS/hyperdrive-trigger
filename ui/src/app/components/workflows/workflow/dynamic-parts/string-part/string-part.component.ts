import {Component, Input, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import {WorkflowEntryModel} from "../../../../../models/workflowEntry.model";

@Component({
  selector: 'app-string-part',
  templateUrl: './string-part.component.html',
  styleUrls: ['./string-part.component.scss']
})
export class StringPartComponent implements OnInit {
  @Input() isShow: boolean;
  @Input() name: string;
  @Input() value: string;
  @Input() property: string;
  @Input() valueChanges: Subject<WorkflowEntryModel>;

  constructor() {}

  ngOnInit(): void {
    if (!this.value) {
      this.value = '';
      this.modelChanged("");
    }
  }

  modelChanged(value: string) {
    this.valueChanges.next(new WorkflowEntryModel(this.property ,this.value));
  }

}
