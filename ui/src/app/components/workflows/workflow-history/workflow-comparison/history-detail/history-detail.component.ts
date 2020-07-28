import { Component, Input } from '@angular/core';
import { PartValidation, PartValidationFactory } from '../../../../../models/workflowFormParts.model';
import { Subject } from 'rxjs';
import { WorkflowEntryModel } from '../../../../../models/workflowEntry.model';
import { HistoryModel } from '../../../../../models/historyModel';

@Component({
  selector: 'app-history-detail',
  templateUrl: './history-detail.component.html',
  styleUrls: ['./history-detail.component.scss'],
})
export class HistoryDetailComponent {
  @Input() historyDetail: HistoryModel;

  isHistoryDetailHidden = false;
  partValidation: PartValidation = PartValidationFactory.create(true, 1000, 1);
  detailsChanges: Subject<WorkflowEntryModel> = new Subject<WorkflowEntryModel>();

  toggleHistoryDetailAccordion() {
    this.isHistoryDetailHidden = !this.isHistoryDetailHidden;
  }
}
