import { PhxConstants } from './../../common/model/phx-constants';

import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';


import { NavigationService } from './../../common/services/navigation.service';
import { CommonService, ApiService } from '../../common/index';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';

import { PhxDataTableSelectionMode, PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableSummaryType } from '../../common/model/index';
import { PhxDataTableColumn } from './../../common/model/data-table/phx-data-table-column';
import { WindowRefService } from '../../common/index';
import { Router } from '@angular/router';

@Component({
  selector: 'app-workorder-template-search',
  templateUrl: './workorder-template-search.component.html',
  styleUrls: ['./workorder-template-search.component.less']
})
export class WorkorderTemplateSearchComponent implements OnInit, OnDestroy {
  @ViewChild('saveModal') saveModal: any;
  @ViewChild('templateGrid') templateGrid;

  codeValueGroups: any;
  ApplicationConstants: any;
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showOpenInNewTab: true
  });

  dataSourceUrl = `template/getTemplatesByEntityTypeId/${PhxConstants.EntityType.Assignment}`;
  odataParams: string = `$select=Id,Name,EntityTypeId,CreatedByFullName,LastModifiedDateTime,IsPrivate,Description,StatusId&$orderby=Id desc`;

  newTemplateName: string;
  newTemplateDesc: string;
  newTemplateStatusId: number;
  templateStatusList: any[] = [];
  command: any = {};
  inputPattern = /^[a-zA-Z0-9][ a-zA-Z0-9]*$/;

  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'Id',
      width: 100,
      caption: 'ID',
      dataType: 'number',
      fixed: true
    }),
    new PhxDataTableColumn({
      dataField: 'Name',
      caption: 'Template Name',
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
      cellTemplate: 'viewDetailTemplate',
      allowFiltering: false,
      allowSearch: false,
      allowSorting: false,
      allowExporting: false,
      allowGrouping: false,
    })
  ];

  constructor(
    private phoenixapi: ApiService,
    private commonService: CommonService,
    private navigationService: NavigationService,
    private codeValueService: CodeValueService,
    private winRef: WindowRefService,
    private router: Router
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.navigationService.setTitle('workorder-template-manage');
    this.templateStatusList = this.getTemplateStatus();
  }

  ngOnDestroy() {
  }

  onRowSelected(event: any) {
    if (event && event.data) {
      this.viewWorkorderTemplate(event.data.Id, event.data.EntityTypeId);
    }
  }

  viewWorkorderTemplate(id, entityTypeId) {
    if (entityTypeId === this.commonService.ApplicationConstants.EntityType.Assignment) {
      this.router.navigate(['/next', 'template', 'workorder', id, 'core']);
    } else if (entityTypeId === this.commonService.ApplicationConstants.EntityType.CommissionRateHeader) {
      // this.$state.go('commission.templateedit', { templateId: id });
      this.router.navigate(['/next', 'commission', 'adjustment', 'edit', id ]);
    }
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
  showPopup() {
    this.saveModal.show();
  }

  hidePopup() {
    this.saveModal.hide();
  }

  openSettingsPopup(rowdata, event) {
    event.stopPropagation();
    this.command.LastModifiedDateTime = rowdata.LastModifiedDateTime;
    this.command.IsPrivate = rowdata.IsPrivate;
    this.command.TemplateId = rowdata.Id;
    console.log(this.command);
    this.newTemplateName = rowdata.Name;
    this.newTemplateDesc = rowdata.Description;
    this.newTemplateStatusId = rowdata.StatusId;
    this.showPopup();
  }

  saveSettings() {
    this.command.Name = this.newTemplateName;
    this.command.Description = this.newTemplateDesc;
    this.command.StatusId = this.newTemplateStatusId;
    this.command.WorkflowPendingTaskId = -1;
    console.log(this.command);
    this.phoenixapi.command('UpdateTemplateSettings', this.command).then((response: any) => {
      this.templateGrid.grid.instance.refresh();
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

  onContextMenuOpenTab(event) {
    if (event.EntityTypeId === this.commonService.ApplicationConstants.EntityType.Assignment) {
      this.winRef.nativeWindow.open('#/next/template/workorder/' + event.Id + '/core', '_blank');
    } else if (event.EntityTypeId === this.commonService.ApplicationConstants.EntityType.CommissionRateHeader) {
      this.winRef.nativeWindow.open('#/templateedit/' + event.Id + '/core', '_blank');
    }
  }

}


