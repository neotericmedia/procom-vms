import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { DxDataGridComponent, DxTemplateDirective, DxTemplateHost, WatcherHelper, DxComponent } from 'devextreme-angular';
import { PhxDataTableConfiguration } from '../../common/model/data-table/phx-data-table-configuration';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';
import { PhxDataTableSummaryItem } from '../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableSummaryType } from '../../common/model/data-table/phx-data-table-summary-type';
import { StateService } from '../../common/state/service/state.service';
import { Router } from '@angular/router';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';
import { NavigationService } from '../../common/services/navigation.service';
import { CommonService } from '../../common/services/common.service';
import { ApiService } from '../../common/index';
import { WindowRefService } from '../../common/index';

declare var oreq: any;
@Component({
  selector: 'app-commission-search-templates',
  templateUrl: './commission-search-templates.component.html',
  styleUrls: ['./commission-search-templates.component.less']
})
export class CommissionSearchTemplatesComponent implements OnInit {
  oDataParams: any;

  @ViewChild('commissionTemplateGrid') commissionTemplateGrid;
  @ViewChild('saveModal') saveModal: any;

  commissions: any;
  currencyColumnFormat = { type: 'fixedPoint', precision: 2 };
  url: string;
  newTemplateName: string;
  newTemplateDesc: string;
  newTemplateStatusId: number;
  templateStatusList: any[] = [];
  command: any = {};
  inputPattern = /^[a-zA-Z0-9][ a-zA-Z0-9]*$/;

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showOpenInNewTab: true
  });

  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'Id',
      caption: 'ID',
      dataType: 'number',
      width: '100px'
    }),
    new PhxDataTableColumn({
      dataField: 'Name',
      caption: 'Template Name',
      dataType: 'string'
    }),
    new PhxDataTableColumn({
      dataField: 'EntityTypeId',
      caption: 'Template Type',
      lookup: {
        dataSource: this.getEntityType(),
        valueExpr: 'value',
        displayExpr: 'text'
      }
    }),
    new PhxDataTableColumn({
      dataField: 'CreatedByFullName',
      caption: 'Created By',
      dataType: 'string'
    }),
    new PhxDataTableColumn({
      dataField: 'StatusId',
      caption: 'Status',
      lookup: {
        dataSource: this.getTemplateStatus(),
        valueExpr: 'value',
        displayExpr: 'text'
      }
    }),
    new PhxDataTableColumn({
      dataField: 'Action',
      caption: 'Action',
      alignment: 'left',
      cellTemplate: 'viewCommissionDetailTemplate',
      allowFiltering: false,
      allowSearch: false,
      allowSorting: false,
      allowExporting: false,
      allowGrouping: false,
    })

  ];

  constructor(
    private phoenixapi: ApiService,
    private navigationService: NavigationService,
    private commonService: CommonService,
    private codeValueService: CodeValueService,
    private winRef: WindowRefService,
    private router: Router
  ) { }

  public onRowClick(event: any) {
    if (event && event.data) {
      this.viewCommissionDetail(event.data);
    } else {
      console.error('Selection collection \'event.data\' does not exist or is missing Id property for navigation: ', event);
    }
  }

  viewCommissionDetail(rowdata) {
    this.router.navigate(['/next/commission/templateedit', rowdata.Id]);
  }

  onContextMenuOpenTab(item) {
    this.winRef.nativeWindow.open(`#/next/commission/templateedit/${item.Id}`, '_blank');
  }

  getEntityType() {
    return this.codeValueService.getCodeValues('app.CodeEntityType', true)
      .sort((a, b) => {
        if (a.code < b.code) {
          return -1;
        }
        if (a.code > b.code) {
          return 1;
        }
        return 0;
      })
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
        };
      });
  }

  getTemplateStatus() {
    return this.codeValueService.getCodeValues('template.CodeTemplateStatus', true)
      .sort((a, b) => {
        if (a.code < b.code) {
          return -1;
        }
        if (a.code > b.code) {
          return 1;
        }
        return 0;
      })
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
        };
      });
  }

  openSettingsPopup(rowdata, event) {
    event.stopPropagation();
    this.command.LastModifiedDateTime = rowdata.LastModifiedDateTime;
    this.command.IsPrivate = rowdata.IsPrivate;
    this.command.TemplateId = rowdata.Id;
    this.newTemplateName = rowdata.Name;
    this.newTemplateDesc = rowdata.Description;
    this.newTemplateStatusId = rowdata.StatusId;
    this.showPopup();
  }

  showPopup() {
    this.saveModal.show();
  }

  hidePopup() {
    this.saveModal.hide();
  }


  saveSettings() {
    this.command.Name = this.newTemplateName;
    this.command.Description = this.newTemplateDesc;
    this.command.WorkflowPendingTaskId = -1;
    this.command.StatusId = this.newTemplateStatusId;
    this.phoenixapi.command('UpdateTemplateSettings', this.command).then((response: any) => {
      this.commissionTemplateGrid.grid.instance.refresh();
      this.hidePopup();
      this.newTemplateName = '';
      this.newTemplateDesc = '';
    });
  }

  cancelSaveSettings() {
    this.newTemplateName = '';
    this.newTemplateDesc = '';
    this.hidePopup();
  }

  ngOnInit() {
    this.navigationService.setTitle('commission-templates-manage');
    this.url = 'template/getCommissionRateTemplates';
    this.oDataParams = oreq.request().withSelect([
      'Id',
      'Name',
      'StatusId',
      'EntityTypeId',
      'CreatedByFullName',
      'LastModifiedDateTime',
      'IsPrivate',
      'Description'
    ]).url();
    this.templateStatusList = this.getTemplateStatus();
  }
}
