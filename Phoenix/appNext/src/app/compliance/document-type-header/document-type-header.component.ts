import { Component, OnInit, Input } from '@angular/core';
import { DocumentTypeService, DocumentType } from '../shared/index';
import { CommonService } from '../../common/index';

@Component({
  selector: 'app-document-type-header',
  templateUrl: './document-type-header.component.html',
  styleUrls: ['./document-type-header.component.less']
})
export class DocumentTypeHeaderComponent implements OnInit {

  @Input() documentType: DocumentType;

  codeValueGroups: any;
  constructor(
    private commonService: CommonService
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
  }

}
