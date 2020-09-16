import { Component, OnInit, Input } from '@angular/core';
import { PhxConstants, CommonService } from '../../../../common';
import { DocumentService } from '../../../../common/services/document.service';

@Component({
  selector: 'app-vms-documents-files',
  templateUrl: './vms-documents-files.component.html'
})
export class VmsDocumentsFilesComponent implements OnInit {
  @Input() document: any;
  @Input() importType: string;
  phxConstants: any;
  codeValueGroups: any;

  constructor(
    private commonService: CommonService,
    private documentService: DocumentService
  ) {
    this.phxConstants = PhxConstants;
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  getCsvStreamByPublicId(publicId: string) {
    return this.documentService.getCsvStreamByPublicId(publicId);
  }

  ngOnInit() {
  }

}
