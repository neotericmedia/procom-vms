import { Component, OnInit, Input } from '@angular/core';
import { Invoice } from '../shared/index';
import { CommonService } from '../../common/services/common.service';
import { InvoiceModuleResourceKeys } from '../invoice-module-resource-keys';

@Component({
  selector: 'app-invoice-header',
  templateUrl: './invoice-header.component.html',
  styleUrls: ['./invoice-header.component.less']
})
export class InvoiceHeaderComponent implements OnInit {
  @Input() invoice: Invoice;

  codeValueGroups: any;
  invoiceModuleResourceKeys: any;

  constructor(
    private commonService: CommonService
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.invoiceModuleResourceKeys = InvoiceModuleResourceKeys;
  }

  ngOnInit() {
  }

}
