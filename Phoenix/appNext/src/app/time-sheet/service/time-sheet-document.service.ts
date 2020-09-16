import { TimeSheet } from './../model/time-sheet';
import { WorkflowAction, PhxDocument } from './../../common/model/index';
import { TimeSheetService } from './time-sheet.service';
import { Injectable } from '@angular/core';
import { StateService } from '../../common/state/state.module';
import { CommonService } from '../../common/index';
import { Observable } from 'rxjs/Rx';
import { timeSheetDocumentActions, timeSheetDocumentState } from '../state/time-sheet-document/index';
import { DocumentService } from '../../common/services/document.service';

@Injectable()
export class TimeSheetDocumentService {

  constructor(private documentService: DocumentService,
    private state: StateService,
    private commonService: CommonService,
    private timeSheetService: TimeSheetService
  ) { }

  getTimeSheetDocumentById(timeSheetId: number): Observable<any> {

    const timeSheetEntityType = this.commonService.ApplicationConstants.EntityType.TimeSheet;

    this.documentService.getEntityDocuments(timeSheetEntityType, timeSheetId)
      .then((documentReponse: any) => {
        this.state.dispatch(timeSheetDocumentActions.documentList.load, documentReponse.Items);
      });

    return this.state.select<Array<PhxDocument>>(timeSheetDocumentState.timeSheetDocument.documentList).asObservable();

  }

  deleteTimeSheetDocumentByWorkflowAction(doc: PhxDocument) {

    this.timeSheetService.executeRemoveDocument(doc)
      .then((response: any) => {

        this.state.dispatch(timeSheetDocumentActions.documentList.delete, doc);

      });

  }

  addTimeSheetDocument(doc: PhxDocument) {

    this.state.dispatch(timeSheetDocumentActions.documentList.add, doc);

  }


}
