import {Component, Input, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import {WorkflowEntryModel} from "../../../../../models/workflowEntry.model";

@Component({
  selector: 'app-guid-part',
  templateUrl: './guid-part.component.html',
  styleUrls: ['./guid-part.component.scss']
})
export class GuidPartComponent implements OnInit {

  @Input() isShow: boolean;
  @Input() name: string;
  @Input() value: string;
  @Input() property: string;
  @Input() valueChanges: Subject<WorkflowEntryModel>;

  constructor() { }

  ngOnInit(): void {
    if(!this.value)
     this.refreshGuid();
  }

  refreshGuid() {
    let newUUID: string = this.getUUID();
    this.modelChanged(newUUID);
  }

  modelChanged(value: string) {
    this.value = value;
    this.valueChanges.next(new WorkflowEntryModel(this.property, this.value));
  }

  getUUID(): string {
    let dt = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

}
