import { Component, OnInit, Input } from '@angular/core';
import { CodeValueGroups } from './../../../../common/model/phx-code-value-groups';
import { CommonService } from '../../../../common';
import { PhxConstants } from '../../../../common/model/index';


@Component({
  selector: 'app-vms-documents-batch-header',
  templateUrl: './vms-documents-batch-header.component.html',
  styleUrls: ['./vms-documents-batch-header.component.less']
})
export class VmsDocumentsBatchHeaderComponent implements OnInit {

  @Input() record: any;

  codeValueGroups: any;
  dateFormat: any;

  constructor(
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.codeValueGroups = CodeValueGroups;
    this.dateFormat = PhxConstants.DateFormat.MMM_ddComma_yyyy;
  }

}
