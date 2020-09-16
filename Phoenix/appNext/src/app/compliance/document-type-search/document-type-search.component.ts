import { Component, OnInit, Inject } from '@angular/core';
import { PhxDataTableConfiguration, PhxDataTableColumn, CodeValue } from '../../common/model/index';
import { CodeValueService, ApiService, NavigationService, CommonService } from '../../common/index';
import { PhxConstants } from '../../common/PhoenixCommon.module';
import { WindowRefService } from '../../common/index';

import { Router, ActivatedRoute } from '@angular/router';
import { DocumentTypeService } from '../shared/index';
declare var oreq: any;

@Component({
  selector: 'app-document-type-search',
  templateUrl: './document-type-search.component.html',
  styleUrls: ['./document-type-search.component.less']
})
export class DocumentTypeSearchComponent implements OnInit {
  codeValueGroup: any = {};
  oDataParams: any;
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showOpenInNewTab: true
  });

  columns: Array<PhxDataTableColumn>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navigationService: NavigationService,
    private codeValueService: CodeValueService,
    private documentTypeService: DocumentTypeService,
    private commonService: CommonService,
    private winRef: WindowRefService,
  ) {
    this.codeValueGroup = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.createColumns();
    this.navigationService.setTitle('document-types-manage');
    this.oDataParams = oreq.request()
      .withSelect([
        'Id',
        'Name',
        'StatusId',
      ]).url();
  }

  createColumns() {
    this.columns = [
      new PhxDataTableColumn({
        dataField: 'Id',
        width: 100,
        caption: 'ID',
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'Name',
        caption: 'Name',
        dataType: 'string'
      }),
      new PhxDataTableColumn({
        dataField: 'StatusId',
        caption: 'Status',
        dataType: 'number',
        lookup: {
          dataSource: this.getStatusLookup(),
          valueExpr: 'value',
          displayExpr: 'text'
        },
      })
    ];
  }

  getStatusLookup() {
    return this.codeValueService.getCodeValues(this.codeValueGroup.UserDefinedCodeComplianceDocumentTypeStatus, true)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
        };
      });
  }

  onRowClick(event: any) {
    if (event && event.data && event.rowType === 'data') {
      this.view(event.data.Id);
    }
  }

  view(id) {
    this.router.navigate([`${id}`], { relativeTo: this.route.parent })
      .catch((err) => {
        console.error(`error navigating to document-type/${id}`, err);
      });
  }

  onContextMenuOpenTab(item) {
    this.winRef.nativeWindow.open(`/#/next/compliance/document-type/${item.Id}`, '_blank');
  }

  createDocumentType() {
    this.documentTypeService.executeCommand(PhxConstants.CommandNamesSupportedByUi.UserDefinedCodeComplianceDocumentTypeNew)
      .then((id: number) => {
        this.view(id);
      });
  }
}
