import { Component, OnInit } from '@angular/core';
import { PhxDataTableConfiguration, RowHighlightingConfig } from '../../common/model/data-table/phx-data-table-configuration';
import { NavigationService } from './../../common/services/navigation.service';


@Component({
  selector: 'app-invoice-search',
  templateUrl: './invoice-search.component.html',
  styleUrls: ['./invoice-search.component.less'],
})
export class InvoiceSearchComponent implements OnInit {
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showOpenInNewTab: true,
    rowHighlightingConfig: new RowHighlightingConfig()
  });

  constructor(
    private navigationService: NavigationService
  ) { }

  ngOnInit() {
    this.navigationService.setTitle('invoice-manage');
  }
}
