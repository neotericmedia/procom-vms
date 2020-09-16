import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';

import { CodeValueService } from './../../services/code-value.service';
import { DataChangeTrackerApiService, CommonService } from '../../index';
import { PhoenixCommonModuleResourceKeys } from '../../PhoenixCommonModule.resource-keys';

@Component({
  selector: 'app-changeHistory',
  templateUrl: './changeHistory.component.html',
  styleUrls: ['./changeHistory.component.css']
})
export class ChangeHistoryComponent implements OnInit {
  @Input() cultureId: number;
  @Input() entityTypeId: number;
  @Input() entityId: number;
  @Input() getByCaptureType: any;
  @Input() blackList: any[];

    loading: boolean = false;
    data: any;
    CodeValueGroups: any;
    phoenixCommonModuleResourceKeys: any;
    globalBlackList: any[] = [
        { TableSchemaName: '', TableName: '', ColumnName: 'SysStartTime' },
        { TableSchemaName: '', TableName: '', ColumnName: 'SysEndTime' }
    ];

  constructor(
    private commonService: CommonService
    , private dataChangeTrackerApiService: DataChangeTrackerApiService
    , private codeValueService: CodeValueService
  ) {
    this.CodeValueGroups = this.commonService.CodeValueGroups;
    this.phoenixCommonModuleResourceKeys = PhoenixCommonModuleResourceKeys;
  }

  ngOnInit() {
    this.getModel();
  }

  getModel() {
    this.loading = true;
    this.dataChangeTrackerApiService.getTrackDataChange(this.entityTypeId, this.entityId)
      .then((responseSuccess: any) => {
        this.loading = false;
        this.changeHistoryModelBuilder(responseSuccess.Items);
      })
      .catch((responseError) => {
        this.loading = false;
        this.changeHistoryModelBuilder([]);
      });
  }

  changeHistoryModelBuilder(data) {
    this.data = data || [];
    let highlight = true;
    const that = this;
    _.forEach(this.data, (set: any) => {
      set.numberOfChangesToShow = 0;

      _.forEach(set.Tables, (table: any) => {

        _.forEach(table.Columns, (column: any) => {

                    const excludedItems = _.some(that.blackList.concat(this.globalBlackList), (blackItem: any) => {
                        return (
                            blackItem.TableSchemaName === table.SchemaName && blackItem.TableName === table.Name && blackItem.ColumnName === column.Name) ||
                            (blackItem.TableSchemaName.length === 0 && blackItem.TableName === table.Name && blackItem.ColumnName === column.Name) ||
                            (blackItem.TableSchemaName.length === 0 && blackItem.TableName.length === 0 && blackItem.ColumnName === column.Name) ||
                            column.Name === 'GroupName'
                            ;
                    });
                    column.itemIsBlack = excludedItems;
                    if (!excludedItems) {
                        column.highlight = !highlight;
                        highlight = !highlight;
                        set.numberOfChangesToShow++;
                    }

          if (column.Name === 'Metadata') {
            if (column.OldValue.Value && column.OldValue.Value.length > 0) {
              table.oldValuesMetadata = eval('(' + column.OldValue.Value + ')');
              if (table.oldValuesMetadata != null && table.oldValuesMetadata.EffectiveDate) {
                set.oldValuesEffectiveDate = table.oldValuesMetadata.EffectiveDate;
                column.OldValue.Value = set.oldValuesEffectiveDate;
              } else if (table.oldValuesMetadata != null && table.oldValuesMetadata.Name) {
                column.OldValue.DisplayValue = table.oldValuesMetadata.Name;
                column.DisplayName = 'Name';
              } else if (table.oldValuesMetadata != null && table.oldValuesMetadata.DisplayValue) {
                column.OldValue.DisplayValue = table.oldValuesMetadata.DisplayValue;
                column.DisplayName = table.oldValuesMetadata.DisplayName ? table.oldValuesMetadata.DisplayName : 'Name';
              }
            }
            if (column.NewValue.Value && column.NewValue.Value.length > 0) {
              table.newValuesMetadata = eval('(' + column.NewValue.Value + ')');
              if (table.newValuesMetadata != null && table.newValuesMetadata.EffectiveDate) {
                set.newValuesEffectiveDate = table.newValuesMetadata.EffectiveDate;
                column.NewValue.Value = set.newValuesEffectiveDate;
              } else if (table.newValuesMetadata != null && table.newValuesMetadata.Name) {
                column.NewValue.DisplayValue = table.newValuesMetadata.Name;
                column.DisplayName = 'Name';
              } else if (table.newValuesMetadata != null && table.newValuesMetadata.DisplayValue) {
                column.NewValue.DisplayValue = table.newValuesMetadata.DisplayValue;
                column.DisplayName = table.newValuesMetadata.DisplayName ? table.newValuesMetadata.DisplayName : 'Name';
              }
            }
          }
          if (column.Name === 'LastModifiedDatetime' || column.Name === 'CreatedDatetime' ||
            column.Name === 'StartDate' || column.Name === 'EndDate' ||
            column.Name === 'EffectiveDate' || column.Name === 'TerminationDate' ||
            column.Name === 'UploadedDatetime' || column.Name === 'UpdateDate' ||
            column.Name === 'RequestTime' || column.Name === 'SendTime' ||
            column.Name === 'OrgReqDate' || column.Name === 'UpdateDate' ||
            column.Name === 'ExpiryDate' || column.Name === 'SpentDate' ||
            column.Name === 'ApprovedOn' || column.Name === 'DateOfBirth' ||
            column.Name === 'DateIncurred' || column.Name === 'SubmissionDatetime'
          ) {
            column.isDate = true;
            column.dateFormat = this.commonService.ApplicationConstants.DateFormat.MMM_dd_yyyy;
            if (column.OldValue.Value && column.OldValue.Value.length > 0) {
              column.OldValue.DisplayValue = column.OldValue.Value;
            }
            if (column.NewValue.Value && column.NewValue.Value.length > 0) {
              column.NewValue.DisplayValue = column.NewValue.Value;
            }
          } else if (column.Name === 'ClientOrganizationId'
            || column.Name === 'InternalOrganizationId'
            || column.Name === 'SampleDocumentId'
            || column.Name === 'TemplateDocumentId') {
            if (column.OldValue.Value && column.OldValue.Value.length > 0) {
              column.OldValue.DisplayValue = eval('(' + column.OldValue.Metadata + ')')[column.Name];
            }
            if (column.NewValue.Value && column.NewValue.Value.length > 0) {
              column.NewValue.DisplayValue = eval('(' + column.NewValue.Metadata + ')')[column.Name];
            }
          } else if (this.entityTypeId === this.commonService.ApplicationConstants.EntityType.Organization || this.entityTypeId === this.commonService.ApplicationConstants.EntityType.UserProfile) {
            if (table.Name === 'PaymentMethod' && (column.Name === 'IsSelected' || column.Name === 'IsPreferred')) {
              if (column.Metadata && column.Metadata.length > 0) {
                const metadataPaymentMethodType = eval('(' + column.Metadata + ')');
                if (metadataPaymentMethodType.PaymentMethodTypeId) {
                  const textPaymentMethodType = this.codeValueService.getCodeValue(metadataPaymentMethodType.PaymentMethodTypeId, this.CodeValueGroups.PaymentMethodType).text;
                  column.DisplayName = textPaymentMethodType + ' ' + column.DisplayName;
                }
              }
            }
          } else if (this.entityTypeId === this.commonService.ApplicationConstants.EntityType.UserProfile) {
            if (table.Name === 'UserProfileWorkerSourceDeduction' && column.Name === 'IsApplied') {
              if (column.Metadata && column.Metadata.length > 0) {
                const sourceDeductionType = eval('(' + column.Metadata + ')');
                if (sourceDeductionType.SourceDeductionTypeId) {
                  const textsourceDeductionType = this.codeValueService.getCodeValue(sourceDeductionType.SourceDeductionTypeId, this.CodeValueGroups.SourceDeductionType).text;
                  column.DisplayName = textsourceDeductionType + ' ' + column.DisplayName;
                }
              }
            }
            if (table.Name === 'UserProfileWorkerOtherEarning' && column.Name === 'IsApplied') {
              if (column.Metadata && column.Metadata.length > 0) {
                const paymentOtherEarningType = eval('(' + column.Metadata + ')');
                if (paymentOtherEarningType.PaymentOtherEarningTypeId) {
                  const textPaymentOtherEarningType = this.codeValueService.getCodeValue(paymentOtherEarningType.PaymentOtherEarningTypeId, this.CodeValueGroups.PaymentOtherEarningType).text;
                  column.DisplayName = textPaymentOtherEarningType + ' ' + column.DisplayName;
                }
              }
            }
          } else if (this.entityTypeId === this.commonService.ApplicationConstants.EntityType.Organization) {
            if (table.Name === 'OrganizationClientRoleLOB' && column.Name === 'IsSelected') {
              if (column.Metadata && column.Metadata.length > 0) {
                const metadataLob = eval('(' + column.Metadata + ')');
                if (metadataLob.LineOfBusinessId) {
                  const textLineOfBusiness = this.codeValueService.getCodeValue(metadataLob.LineOfBusinessId, this.CodeValueGroups.LineOfBusiness).text;
                  column.DisplayName = textLineOfBusiness + ' ' + column.DisplayName;
                }
              }
            }
            if (table.Name === 'OrganizationInternalRole' &&
              (column.Name === 'DocumentIdHeader' || column.Name === 'DocumentIdFooter' ||
                column.Name === 'DocumentIdLandscapeHeader' || column.Name === 'DocumentIdLandscapeFooter')) {
              if (column.NewValue.Value && column.NewValue.Value.length > 0) {
                column.NewValue.DisplayValue = eval('(' + column.NewValue.Metadata + ')')[column.Name];
              }
              if (column.OldValue.Value && column.OldValue.Value.length > 0) {
                column.OldValue.DisplayValue = eval('(' + column.OldValue.Metadata + ')')[column.Name];
              }
            }
          } else if (this.entityTypeId === this.commonService.ApplicationConstants.EntityType.ComplianceDocumentRule) {
            if (table.Name === 'ComplianceDocumentRuleRequiredSituation' && column.Name === 'IsSelected') {
              if (column.Metadata && column.Metadata.length > 0) {
                const metadataRequiredSituationType = eval('(' + column.Metadata + ')');
                if (metadataRequiredSituationType.ComplianceDocumentRuleRequiredSituationTypeId) {
                  const textRequiredSituationType = this.codeValueService.getCodeValue(metadataRequiredSituationType.ComplianceDocumentRuleRequiredSituationTypeId, this.CodeValueGroups.ComplianceDocumentRuleRequiredSituationType).text;
                  column.DisplayName = textRequiredSituationType + ' ' + column.DisplayName;
                }
              }
            }
          } else if (this.entityTypeId === this.commonService.ApplicationConstants.EntityType.ComplianceDocumentRule) {
            if (table.Name === 'ComplianceDocumentRuleProfileVisibility' && column.Name === 'IsSelected') {
              if (column.Metadata && column.Metadata.length > 0) {
                const metadataRequiredSituationType = eval('(' + column.Metadata + ')');
                if (metadataRequiredSituationType.ComplianceDocumentRuleProfileVisibilityTypeId) {
                  const textProfileVisibilityType = this.codeValueService.getCodeValue(metadataRequiredSituationType.ComplianceDocumentRuleProfileVisibilityTypeId, this.CodeValueGroups.ComplianceDocumentRuleProfileVisibilityType).text;
                  column.DisplayName = textProfileVisibilityType + ' ' + column.DisplayName;
                }
              }
            }
          } else if (this.entityTypeId === this.commonService.ApplicationConstants.EntityType.ComplianceDocumentRule) {
            if (table.Name === 'ComplianceDocumentRuleRestriction' && (column.Name === 'InternalOrganizationId' || column.Name === 'ClientOrganizationId')) {
              if (column.NewValue.Value && column.NewValue.Value.length > 0) {
                column.NewValue.DisplayValue = eval('(' + column.NewValue.Metadata + ')')[column.Name];
              }
              if (column.OldValue.Value && column.OldValue.Value.length > 0) {
                column.OldValue.DisplayValue = eval('(' + column.OldValue.Metadata + ')')[column.Name];
              }
            }
          } else {
            let metaData: any = column.Metadata;
            if (metaData && metaData.length > 0) {
              metaData = eval('(' + metaData + ')');
              if (metaData.hasOwnProperty(column.Name)) {
                column.DisplayName = metaData[column.Name];
              }
            }
          }

          column.DisplayName = column.GroupName + column.DisplayName;

        });
      });
    });
  }

}
