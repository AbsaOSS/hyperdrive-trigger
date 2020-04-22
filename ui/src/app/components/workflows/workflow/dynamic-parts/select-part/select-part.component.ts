import {Component, Input, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import {WorkflowEntryModel} from "../../../../../models/workflowEntry.model";

@Component({
  selector: 'app-select-part',
  templateUrl: './select-part.component.html',
  styleUrls: ['./select-part.component.scss']
})
export class SelectPartComponent implements OnInit {

  @Input() isShow: boolean;
  @Input() name: string;
  @Input() value: string;
  @Input() property: string;
  @Input() options: string[];
  @Input() valueChanges: Subject<WorkflowEntryModel>;

  constructor() { }

  ngOnInit(): void {
    if(!this.value || this.value == '') {
      this.value = this.options[0];
      this.modelChanged(this.value)}
  }

  modelChanged(value: any) {
    this.valueChanges.next(new WorkflowEntryModel(this.property, this.value));
  }

}
