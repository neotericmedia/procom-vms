import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { PhxDataTableConfiguration, PhxDataTableColumn, PhxDataTableStateSavingMode, CodeValue, UserProfile, UserInfo } from '../../common/model';
import { PhxDataTableComponent } from '../../common/components/phx-data-table/phx-data-table.component';
import { CommonService, CodeValueService, PhxLocalizationService } from '../../common';
import * as _ from 'lodash';
import { PaymentModuleResourceKeys } from './../payment-module-resource-keys';
@Component({
  selector: 'app-payment-ytd-earnings-details',
  templateUrl: './payment-ytd-earnings-details.component.html',
  styleUrls: ['./payment-ytd-earnings-details.component.less']
})
export class PaymentYtdEarningsDetailsComponent implements OnInit {

  constructor(
    protected commonService: CommonService,
    private codeValueService: CodeValueService,
    protected localizationService: PhxLocalizationService,
  ) {
    this.paymentModuleResourceKeys = PaymentModuleResourceKeys;
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.ApplicationConstants = this.commonService.ApplicationConstants;
    this.unitTypes = this.getUnitTypeLookup();
  }
  paymentModuleResourceKeys: any;
  internalOrganizations: any = [];
  clientOrganizations: any = [];
  codeValueGroups: any;
  ApplicationConstants: any;
  unitTypes: any;
  componentName: any = 'PaymentYtdEarningsDetailsComponent';
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    stateSavingMode: PhxDataTableStateSavingMode.None,
    enableExport: false,
    masterDetailTemplateName: 'detail',
    enableMasterDetail: true
  });
  detailDataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    stateSavingMode: PhxDataTableStateSavingMode.None,
    enableExport: false,
    showSearch: false,
    showFilter: false,
    showGrouping: false,
    showColumnChooser: false,
    showTotalCount: false,
  });
  @ViewChild('grid') grid: PhxDataTableComponent;
  @Input() fnGetInternalOrgLookup: Function;
  @Input() fnGetClinetLookup: Function;
  @Input() data: any;
  @Input() userInfo: UserInfo;
  columns: Array<PhxDataTableColumn> = [];
  detailColumns: Array<PhxDataTableColumn>;

  public static generalCols = [];

  public static cols = [];

  public static colsGrossNet = [];

  ngOnInit() {
    this.generateColumns();
  }

  public static generateTransactionColumns(data): PhxDataTableColumn[] {
    const columns = [].concat(PaymentYtdEarningsDetailsComponent.generalCols);
    for (let index = 0; index < data.cols.length; index++) {
      const element = data.cols[index];

      const hasValue = element.value;
      if (!!hasValue) {
        const col = _.find(PaymentYtdEarningsDetailsComponent.cols, item => item.dataField === element.key);
        columns.push(col);
      }
    }
    return columns.concat(PaymentYtdEarningsDetailsComponent.colsGrossNet);
  }

  generateColumns() {
    PaymentYtdEarningsDetailsComponent.cols = [
      new PhxDataTableColumn({
        dataField: 'AmountCpp',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.cpp),
        dataType: 'number',
        cellTemplate: 'currencyTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'AmountQpp',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.qpp),
        dataType: 'number',
        cellTemplate: 'currencyTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'AmountEi',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.ei),
        dataType: 'number',
        cellTemplate: 'currencyTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'AmountFederalTax',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.federalTax),
        dataType: 'number',
        cellTemplate: 'currencyTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'AmountProvincialTax',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.provincialTax),
        dataType: 'number',
        cellTemplate: 'currencyTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'AmountPip',
        caption: 'PIP',
        dataType: 'number',
        cellTemplate: 'currencyTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'AmountNonResidentWithholdingTax',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.nonResidentWithHoldingTax),
        dataType: 'number',
        cellTemplate: 'currencyTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'AmountAdditionalTax',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.additionalTax),
        dataType: 'number',
        cellTemplate: 'currencyTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'AmountBenefits',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.benefits),
        dataType: 'number',
        cellTemplate: 'currencyTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'AmountGarnishments',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.garnishments),
        dataType: 'number',
        cellTemplate: 'currencyTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'AmountAdvances',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.advances),
        dataType: 'number',
        cellTemplate: 'currencyTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'AmountGstHst',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.gsthst),
        dataType: 'number',
        cellTemplate: 'currencyTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'AmountQst',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.qst),
        dataType: 'number',
        cellTemplate: 'currencyTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'AmountPst',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.pst),
        dataType: 'number',
        cellTemplate: 'currencyTemplate'
      }),
    ];
    PaymentYtdEarningsDetailsComponent.generalCols = [
      new PhxDataTableColumn({
        dataField: 'OrganizationInternalDisplayName',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.internalCompany),
        dataType: 'string'
      }),
      new PhxDataTableColumn({
        dataField: 'OrganizationClientDisplayName',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.client),
        dataType: 'string'
      }),
      new PhxDataTableColumn({
        dataField: 'PaymentTransactionNumber',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.paymentTransNo),
      }),
      new PhxDataTableColumn({
        dataField: 'PaymentReleaseDate',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.paymentReleaseDate),
        dataType: 'date',
      }),
      new PhxDataTableColumn({
        dataField: 'PaymentTransactionStartDate',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.paymentTransFrom),
        dataType: 'date',
      }),
      new PhxDataTableColumn({
        dataField: 'PaymentTransactionEndDate',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.paymentTransTo),
        dataType: 'date',
      })
    ];
    PaymentYtdEarningsDetailsComponent.colsGrossNet = [
      new PhxDataTableColumn({
        dataField: 'AmountGross',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.grossAmount),
        dataType: 'number',
        cellTemplate: 'currencyTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'AmountNet',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.totalAmount),
        dataType: 'number',
        cellTemplate: 'currencyTemplate'
      }),
    ];
    this.detailColumns = [
      new PhxDataTableColumn({
        dataType: 'number',
        dataField: 'RateTypeId',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.rateType),
        width: '150',
        lookup: {
          dataSource: this.getRateTypeLookup(),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataType: 'number',
        alignment: 'right',
        dataField: 'Units',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.units),
        width: '100',
        calculateDisplayValue: (e) => {
          const unit = this.unitTypes.find(u => u.value === e.RateUnitId);
          let unitText = unit.text;
          if (_.includes([this.ApplicationConstants.RateUnit.Hour, this.ApplicationConstants.RateUnit.Day], e.RateUnitId) && e.Units > 1) {
            unitText += 's';
          }
          return e.Units + ' ' + unitText;
        }
      }),
      new PhxDataTableColumn({
        dataType: 'number',
        dataField: 'Rate',
        caption: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.rate),
        width: '100',
        cellTemplate: 'currencyTemplate'
      }),
    ];
    this.columns = PaymentYtdEarningsDetailsComponent.generateTransactionColumns(this.data);
  }

  onEditorPrepared(e: any) {

  }

  onEditorPreparing(e: any) {
    if (['PaymentReleaseDate', 'PaymentTransactionStartDate', 'PaymentTransactionEndDate'].includes(e.dataField)) {
      e.editorOptions.min = this.data.filters.startDate;
      e.editorOptions.max = this.data.filters.endDate;
    }
  }

  getRateTypeLookup() {
    return this.codeValueService
      .getCodeValues(this.codeValueGroups.RateType, true)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
        };
      });
  }

  getUnitTypeLookup() {
    return this.codeValueService
      .getCodeValues(this.codeValueGroups.RateUnit, true)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
        };
      });
  }

}
