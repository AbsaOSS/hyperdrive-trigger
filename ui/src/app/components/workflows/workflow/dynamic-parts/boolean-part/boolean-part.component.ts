import {Component, Input, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import {WorkflowEntryModel} from "../../../../../models/workflowEntry.model";

@Component({
  selector: 'app-boolean-part',
  templateUrl: './boolean-part.component.html',
  styleUrls: ['./boolean-part.component.scss']
})
export class BooleanPartComponent implements OnInit {
  @Input() isShow: boolean;
  @Input() name: string;
  @Input() value: boolean;
  @Input() property: string;
  @Input() valueChanges: Subject<WorkflowEntryModel>;

  constructor() { }

  ngOnInit(): void {
    if(!this.value){
      this.modelChanged(false);
    }
  }

  modelChanged(value: boolean) {
    this.value = value;
    this.valueChanges.next(new WorkflowEntryModel(this.property, this.value));
  }

}
