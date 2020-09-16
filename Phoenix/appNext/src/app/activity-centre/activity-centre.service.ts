import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Injectable } from '@angular/core';
import { ApiService, CodeValueService, CommonService, PhxConstants } from '../common/index';
import {
  ActivityCardFieldType,
  ActivityCard,
  ACTIVITY_CENTRE_DEBUG,
  ActivityResponse,
  ActivityEntityField,
  ActivityCardField,
  ActivityCardConfig,
  ActivityTotalResponse,
  ActivityTotal,
  ActivityCount,
  ActivityEntityItem,
  TaskType,
  ActivityNewItemCount
} from './model/index';
import * as moment from 'moment';
import { PhxLocalizationService } from '../common/services/phx-localization.service';
import { EntityList } from '../common/model';
import { PhoenixCommonModuleResourceKeys } from '../common/PhoenixCommon.module';

@Injectable()
export class ActivityCentreService {
  idLabel: string;
  userProfileNoOrganizationPlaceholder: string;

  constructor(private apiService: ApiService, private codeValueService: CodeValueService, private commonService: CommonService, private localizationService: PhxLocalizationService) {
    this.idLabel = localizationService.translate(PhoenixCommonModuleResourceKeys.generic.id);
    this.userProfileNoOrganizationPlaceholder = localizationService.translate('activityCentre.card.userProfileNoOrganizationPlaceholder');
  }

  private filterSelections$ = new Subject<number[]>();
  public updateFilterSelection(filters: number[]) {
    this.filterSelections$.next(filters);
  }
  public clearFilterSelection() {
    this.filterSelections$.next([]);
  }
  public filterSelectionChange$(): Observable<number[]> {
    return this.filterSelections$.asObservable();
  }

  public existsOtherEntityType(taskType: TaskType, entityId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.apiService
        .query(`activityCentre/existsOtherEntityType/${taskType}/${entityId}`, true)
        .then((response: boolean) => {
          resolve(response);
        })
        .catch(ex => {
          reject(ex);
        });
    });
  }

  public getActivityTotals(taskType: TaskType, cardTotals: Array<ActivityTotal>, entityId?: number, resetAllNewCount?: boolean, skipErrorIntercept?: boolean): Promise<ActivityTotal[]> {
    const entityPath = entityId ? `/${entityId}` : '';
    return new Promise((resolve, reject) => {
      // RezaR: For now don't show loading to make user be able to work with app while loading
      this.apiService
        .query(`activityCentre/getSummaryTotals/${taskType}${entityPath}`, false, skipErrorIntercept)
        .then((response: ActivityTotalResponse) => {
          resolve(this.formatTotals(response, cardTotals, entityId, resetAllNewCount));
        })
        .catch(ex => {
          reject(ex);
        });
    });
  }

  public getActivitySummary(taskType: TaskType, skip: number, top: number, entityId?: number, statusIdList?: string, showLoader: boolean = true): Promise<ActivityCard[]> {
    const entityPath = entityId ? `/${entityId}` : '';
    const statusIdListPath = entityId && statusIdList && statusIdList.length ? `/${statusIdList}` : '';
    return new Promise((resolve, reject) => {
      // RezaR: For now don't show loading to make user be able to work with app while loading
      this.apiService
        .query(`activityCentre/getAllRecords/${taskType}${entityPath}${statusIdListPath}?$skip=${skip}&$top=${top}`, false)
        .then((response: ActivityResponse) => {
          resolve(this.formatCards(response));
        })
        .catch(ex => {
          reject(ex);
        });
    });
  }

  public getActivityCountNewItems(taskType: number, entityTypeId: number, minPendingTaskId: number): Promise<ActivityNewItemCount> {
    return new Promise((resolve, reject) => {
      this.apiService
        .query(`activityCentre/getSummaryTotals/${taskType}/${entityTypeId}/${minPendingTaskId}`, false)
        .then((response: EntityList<ActivityCount>) => {
          const result: ActivityNewItemCount = {
            minPendingTaskId: minPendingTaskId,
            count: response.Items.reduce((sum, curr) => sum + curr.Count, 0),
            byTotals: response.Items
          };
          resolve(result);
        })
        .catch(ex => {
          reject(ex);
        });
    });
  }

  public pollTotalCount(taskTypeId: number, entityTypeId: number, takeWhile: () => boolean): Observable<ActivityTotal[]> {
    // https://stackoverflow.com/questions/41658162/how-to-do-polling-with-angular-2-observables/41658823#41658823
    return Observable.interval(5000)
      .takeWhile(takeWhile)
      .exhaustMap(() => {
        const cardTotals: Array<ActivityTotal> = [];
        return this.retryGetActivityTotals(taskTypeId, cardTotals, entityTypeId);
      });
  }

  private retryGetActivityTotals(taskTypeId: number, cardTotals: Array<ActivityTotal>, entityTypeId: number) {
    return Observable.fromPromise(this.getActivityTotals(taskTypeId, cardTotals, entityTypeId, false, true)).retryWhen(errors => {
      return this.retryGetActivityTotals(taskTypeId, cardTotals, entityTypeId);
    });
  }

  private getDebugCard(): ActivityCard[] {
    if (ACTIVITY_CENTRE_DEBUG) {
      return [
        {
          entityId: null,
          entityTypeId: null,
          pendingTaskId: -1,
          entityAbbreviation: '8()',
          actionLink: null,
          cardFields: []
        }
      ];
    } else {
      return [];
    }
  }

  getDateRange(entityFields: Array<ActivityEntityField>, dateStartFieldName: string, dateEndFieldName: string) {
    const dateStart = this.getEntityFieldValueByName(entityFields, dateStartFieldName);
    const dateEnd = this.getEntityFieldValueByName(entityFields, dateEndFieldName);

    if (dateStart && dateEnd) {
      return `${this.toDate(dateStart)} -  ${this.toDate(dateEnd)}`;
    } else {
      return '';
    }
  }

  getFormattedElaspedMinutes(minutes: number, showDecimals: boolean, showUnits: boolean, acronymForUnits: boolean): any {
    let unitValue: number = minutes;
    let unitType: string;
    let result: string;

    if (minutes === 1) {
      unitValue = 1;
      unitType = 'minute';
    } else if (minutes < 60) {
      unitType = 'minutes';
    } else if (minutes >= 60 && minutes < 120) {
      unitValue = 1;
      unitType = 'hour';
    } else if (minutes < 1440) {
      unitValue = minutes / 60;
      unitType = 'hours';
    } else if (minutes >= 1440 && minutes < 2880) {
      unitValue = 1;
      unitType = 'day';
    } else {
      unitValue = minutes / 1440;
      unitType = 'days';
    }

    result = unitValue.toFixed(2);

    if (!showDecimals) {
      result = Math.floor(unitValue) + '';
    }

    if (showUnits) {
      result += ' ' + this.localizationService.translate('common.generic.' + (acronymForUnits ? unitType + 'Short' : unitType)).toLowerCase();
    }

    return result;
  }

  getDate(entityFields: Array<ActivityEntityField>, dateFieldName: string): string {
    const date = this.getEntityFieldValueByName(entityFields, dateFieldName);

    if (date) {
      return `${this.toDate(date)}`;
    } else {
      return '';
    }
  }

  toDate(dateString: string) {
    return dateString ? moment(moment(dateString, 'YYYY-MM-DD').toDate()).format(PhxConstants.DateFormat.mediumDate) : '';
  }

  formatTotals(activityTotalResponse: ActivityTotalResponse, cardTotals: Array<ActivityTotal>, entityId?: number, resetAllNewCount?: boolean): Array<ActivityTotal> {
    const totals: Array<ActivityTotal> = [];

    activityTotalResponse.Items.forEach((t: ActivityCount) => {
      const existing = cardTotals.find(total => total.entityTypeId === t.EntityTypeId && total.statusId === t.StatusId);
      if (existing) {
        if (existing.isActive || resetAllNewCount) {
          existing.showBadge = false;
          existing.total = t.Count;
          existing.maxPendingTaskId = t.MaxPendingTaskId;
        }
        totals.push(existing);
      } else {
        const total: ActivityTotal = {
          entityTypeId: t.EntityTypeId,
          statusId: t.StatusId,
          description: t.StatusId === 0 ? this.getLocalizedEntityName(t.EntityTypeId, t.Count !== 1 ? true : false) : t.Description,
          total: t.Count,
          maxPendingTaskId: t.MaxPendingTaskId,
          showBadge: false,
          linkTo: null,
          isActive: false
        };

        if (!total.statusId) {
          total.linkTo = total.entityTypeId.toString();
        }

        totals.push(total);
      }
    });

    return totals;
  }

  public formatCards(activityResponse: ActivityResponse): Array<ActivityCard> {
    let cards: Array<ActivityCard> = this.getDebugCard();
    const self = this;

    for (const entityDetail of activityResponse.Items) {
      switch (entityDetail.EntityType) {
        case 'WorkOrderVersion':
          {
            const woCard: ActivityCard = {
              entityTypeId: 17,
              entityId: entityDetail.EntityId,
              pendingTaskId: entityDetail.PendingTaskId,
              entityAbbreviation: 'WO',
              isTest: entityDetail.IsTest,
              actionLink: `#/next/workorder/0/0/${entityDetail.EntityId}/core`,
              cardFields: this.initializeWorkOrderVersionFields(entityDetail.Fields)
            };
            cards.push(woCard);
          }
          break;
        case 'Timesheet':
          {
            const tsCard: ActivityCard = {
              entityTypeId: 9,
              entityId: entityDetail.EntityId,
              pendingTaskId: entityDetail.PendingTaskId,
              entityAbbreviation: 'TS',
              actionLink: `#/next/timesheet/${entityDetail.EntityId}`,
              cardFields: this.initializeTimeSheetFields(entityDetail.Fields),
              userProfileIdWorker: entityDetail.Fields.find(x => x.Name === 'UserProfileIdWorker') && parseInt(entityDetail.Fields.find(x => x.Name === 'UserProfileIdWorker').Value, 10)
            };
            cards.push(tsCard);
          }
          break;
        case 'Organization':
          {
            const orgCard: ActivityCard = {
              entityTypeId: 1,
              entityId: entityDetail.EntityId,
              pendingTaskId: entityDetail.PendingTaskId,
              entityAbbreviation: 'ORG',
              actionLink: `#/next/organization/${entityDetail.EntityId}/details`,
              cardFields: this.initializeOrganizationFields(entityDetail.Fields)
            };
            cards.push(orgCard);
          }
          break;
        case 'Payment':
          {
            const payCard: ActivityCard = {
              entityTypeId: 23,
              entityId: entityDetail.EntityId,
              pendingTaskId: entityDetail.PendingTaskId,
              entityAbbreviation: 'PAY',
              isTest: entityDetail.IsTest,
              actionLink: `#/next/payment/search/${entityDetail.EntityId}`,
              cardFields: this.initializePaymentFields(entityDetail.Fields)
            };
            cards.push(payCard);
          }
          break;
        case 'People':
          {
            const profileTypeField = entityDetail.Fields.find(x => x.Name === 'ProfileTypeId');
            const profileTypeId = profileTypeField ? profileTypeField.Value : null;

            const pplCard: ActivityCard = {
              entityTypeId: 50,
              entityId: entityDetail.EntityId,
              pendingTaskId: entityDetail.PendingTaskId,
              entityAbbreviation: 'PRO',
              actionLink: this.getPeopleNavigationLink(entityDetail.EntityId, profileTypeId, entityDetail.Fields[5].Value),
              cardFields: this.initializePeopleFields(+profileTypeId, entityDetail.Fields)
            };
            cards.push(pplCard);
          }
          break;
        case 'PaymentTransaction':
          {
            const ptCard: ActivityCard = {
              entityTypeId: 21,
              entityId: entityDetail.EntityId,
              pendingTaskId: entityDetail.PendingTaskId,
              entityAbbreviation: 'PT',
              isTest: entityDetail.IsTest,
              actionLink: this.getPaymentTransactionNavigationLink(entityDetail.Fields),
              cardFields: this.initializePaymentTransactionFields(entityDetail.Fields)
            };
            cards.push(ptCard);
          }
          break;
        case 'Document':
          {
            const docCard: ActivityCard = {
              entityTypeId: 87,
              entityId: entityDetail.EntityId,
              pendingTaskId: entityDetail.PendingTaskId,
              entityAbbreviation: 'DOC',
              isTest: entityDetail.IsTest,
              actionLink: this.getDocumentNavigationLink(entityDetail.Fields),
              cardFields: this.initializeDocumentFields(entityDetail.Fields)
            };
            cards.push(docCard);
          }
          break;
        case 'ExpenseClaim':
          {
            const tsCard: ActivityCard = {
              entityTypeId: 96,
              entityId: entityDetail.EntityId,
              pendingTaskId: entityDetail.PendingTaskId,
              entityAbbreviation: 'EX',
              actionLink: `#/next/expense/${entityDetail.EntityId}`,
              cardFields: this.initializeExpenseFields(entityDetail.Fields),
              userProfileIdWorker: entityDetail.Fields.find(x => x.Name === 'UserProfileIdWorker') && parseInt(entityDetail.Fields.find(x => x.Name === 'UserProfileIdWorker').Value, 10)
            };
            cards.push(tsCard);
          }
          break;
      }
    }

    cards = cards.map(function(item, index) {
      item.cardFields.map(function(item2, index2) {
        if (item2.fieldName === 'PastDue') {
          item2.displayData = self.getFormattedElaspedMinutes(Number.parseFloat(item2.displayData), false, true, true);
        }
        return item2;
      });
      return item;
    });

    return cards;
  }

  private getPaymentTransactionNavigationLink(entityFields: Array<ActivityEntityField>) {
    const transactionHeaderId = this.getEntityFieldValueByName(entityFields, 'TransactionHeaderId');
    return `#/transaction/${transactionHeaderId}/summary`;
  }

  private getDocumentNavigationLink(entityFields: Array<ActivityEntityField>) {
    const documentEntityTypeId = this.getEntityFieldValueByName(entityFields, 'DocumentEntityTypeId');
    const documentEntityId = +this.getEntityFieldValueByName(entityFields, 'DocumentEntityId');

    let url = null;

    switch (documentEntityTypeId) {
      case '13':
        const workOrderId = this.getEntityFieldValueByName(entityFields, 'DocumentEntityFK1');
        const assignmentId = this.getEntityFieldValueByName(entityFields, 'DocumentEntityFK2');
        if (assignmentId && workOrderId) {
          url = `#/next/workorder/${assignmentId}/${workOrderId}/${documentEntityId}/compliancedocuments`;
        }
        break;
      case '50':
        const contactId = this.getEntityFieldValueByName(entityFields, 'DocumentEntityFK1');
        const profileTypeId = this.getEntityFieldValueByName(entityFields, 'DocumentEntityFK2');
        if (profileTypeId && contactId) {
          url = `#/next/contact/${documentEntityId}/profile/${profileTypeId}/${contactId}`;
        }
        break;
      default:
        const organizationId = this.getEntityFieldValueByName(entityFields, 'DocumentEntityFK1');
        if (organizationId) {
          url = `#/next/organization/${organizationId}/roles`;
        }
        break;
    }
    return url;
  }

  private getPeopleNavigationLink(entityId: number, profileTypeId: string, contactId: string) {
    switch (profileTypeId) {
      case '1':
        return `#/next/contact/${contactId}/profile/organizational/${entityId}`;
      case '2':
        return `#/next/contact/${contactId}/profile/internal/${entityId}`;
      case '3':
        return `#/next/contact/${contactId}/profile/workertemp/${entityId}`;
      case '4':
        return `#/next/contact/${contactId}/profile/workercanadiansp/${entityId}`;
      case '5':
        return `#/next/contact/${contactId}/profile/workercanadianinc/${entityId}`;
      case '6':
        return `#/next/contact/${contactId}/profile/workersubvendor/${entityId}`;
      case '7':
        return `#/next/contact/${contactId}/profile/workerunitedstatesw2/${entityId}`;
      case '8':
        return `#/next/contact/${contactId}/profile/workerunitedstatesllc/${entityId}`;
      case '9':
        return `#/next/contact/${contactId}/profile/workerunitedstatesllc/${entityId}`;
      default:
        return null;
    }
  }

  public initializeDocumentFields(entityFields: Array<ActivityEntityField>): Array<ActivityCardField> {
    const cardFields: Array<ActivityCardField> = [];
    const ruleRequiredTypeId = this.getEntityFieldValueByName(entityFields, 'RuleRequiredTypeId');

    for (const field of entityFields) {
      if (ActivityCardConfig.Document.hasOwnProperty(field.Name) && field.Value) {
        cardFields.push({
          displayData: field.Value,
          fieldName: field.Name,
          fieldType: ActivityCardConfig.Document[field.Name].fieldType,
          slotId: ActivityCardConfig.Document[field.Name].slotId
        });
      }
    }

    cardFields.push({
      displayData: this.getDocumentEntityReference(entityFields),
      fieldName: '',
      fieldType: ActivityCardFieldType.string,
      slotId: 6
    });

    cardFields.push({
      displayData: ruleRequiredTypeId ? this.codeValueService.getCodeValueText(parseInt(ruleRequiredTypeId, 10), this.commonService.CodeValueGroups.ComplianceDocumentRuleRequiredType) : null,
      fieldName: '',
      fieldType: ActivityCardFieldType.string,
      slotId: 2
    });

    cardFields.push({
      displayData: this.getDocumentEntityType(entityFields),
      fieldName: '',
      fieldType: ActivityCardFieldType.string,
      slotId: 4
    });

    cardFields.push({
      displayData: this.getDate(entityFields, 'SnoozeExpiryDate'),
      fieldName: '',
      fieldType: ActivityCardFieldType.date,
      slotId: 16
    });

    return cardFields;
  }

  private getDocumentEntityType(entityFields: Array<ActivityEntityField>): string {
    const entityTypeIdStr = this.getEntityFieldValueByName(entityFields, 'DocumentEntityTypeId');
    let entityTypeId = entityTypeIdStr ? parseInt(entityTypeIdStr, 10) : null;

    switch (entityTypeId) {
      case 58:
      case 59:
      case 60:
      case 90:
      case 109:
        entityTypeId = 1;
    }

    return entityTypeId ? this.codeValueService.getCodeValueText(entityTypeId, this.commonService.CodeValueGroups.EntityType) : null;
  }

  private getDocumentEntityReference(entityFields: Array<ActivityEntityField>): string {
    const entityReference = this.getEntityFieldValueByName(entityFields, 'DocumentEntityReference');
    let entityStatus: string;
    const entityStatusId = this.getEntityFieldValueByName(entityFields, 'DocumentEntityStatusId');

    switch (this.getEntityFieldValueByName(entityFields, 'DocumentEntityTypeId')) {
      case '13':
        entityStatus = this.codeValueService.getCodeValueText(parseInt(entityStatusId, 10), this.commonService.CodeValueGroups.WorkOrderStatus);
        break;
      case '50':
        entityStatus = this.codeValueService.getCodeValueText(parseInt(entityStatusId, 10), this.commonService.CodeValueGroups.ProfileStatus);
        break;
      case '58':
      case '59':
      case '60':
      case '90':
      case '109':
        entityStatus = this.codeValueService.getCodeValueText(parseInt(entityStatusId, 10), this.commonService.CodeValueGroups.OrganizationStatus);
        break;
    }
    return entityReference ? entityReference + (entityStatus ? ' (' + entityStatus + ')' : '') : null;
  }

  public initializeWorkOrderVersionFields(entityFields: Array<ActivityEntityField>): Array<ActivityCardField> {
    const cardFields: Array<ActivityCardField> = [];

    for (const field of entityFields) {
      if (ActivityCardConfig.WorkOrderVersion.hasOwnProperty(field.Name)) {
        cardFields.push({
          displayData: field.Value,
          fieldName: field.Name,
          fieldType: ActivityCardConfig.WorkOrderVersion[field.Name].fieldType,
          slotId: ActivityCardConfig.WorkOrderVersion[field.Name].slotId
        });
      }
    }

    cardFields.push({
      displayData: this.getDateRange(entityFields, 'StartDate', 'EndDate'),
      fieldName: '',
      fieldType: ActivityCardConfig.WorkOrderVersion.DateRange.fieldType,
      slotId: ActivityCardConfig.WorkOrderVersion.DateRange.slotId
    });

    return cardFields;
  }

  public initializeTimeSheetFields(entityFields: Array<ActivityEntityField>): Array<ActivityCardField> {
    const cardFields: Array<ActivityCardField> = [];
    for (const field of entityFields) {
      if (ActivityCardConfig.TimeSheet.hasOwnProperty(field.Name)) {
        cardFields.push({
          displayData: field.Value,
          fieldName: field.Name,
          fieldType: ActivityCardConfig.TimeSheet[field.Name].fieldType,
          slotId: ActivityCardConfig.TimeSheet[field.Name].slotId
        });
      }
    }

    cardFields.push({
      displayData: this.getDateRange(entityFields, 'StartDate', 'EndDate'),
      fieldName: '',
      fieldType: ActivityCardConfig.TimeSheet.DateRange.fieldType,
      slotId: ActivityCardConfig.TimeSheet.DateRange.slotId
    });

    cardFields.push({
      displayData: this.idLabel,
      fieldName: '',
      fieldType: ActivityCardConfig.TimeSheet.IdLabel.fieldType,
      slotId: ActivityCardConfig.TimeSheet.IdLabel.slotId
    });

    return cardFields;
  }

  public initializeExpenseFields(entityFields: Array<ActivityEntityField>): Array<ActivityCardField> {
    const cardFields: Array<ActivityCardField> = [];
    for (const field of entityFields) {
      if (ActivityCardConfig.Expense.hasOwnProperty(field.Name)) {
        cardFields.push({
          displayData: field.Value,
          fieldName: field.Name,
          fieldType: ActivityCardConfig.Expense[field.Name].fieldType,
          slotId: ActivityCardConfig.Expense[field.Name].slotId
        });
      }
    }

    cardFields.push({
      displayData: this.getDateRange(entityFields, 'StartDate', 'EndDate'),
      fieldName: '',
      fieldType: ActivityCardConfig.Expense.DateRange.fieldType,
      slotId: ActivityCardConfig.Expense.DateRange.slotId
    });

    const expenseClaimId = this.getEntityFieldValueByName(entityFields, 'ExpenseClaimId');
    const expenseClaimTitle = this.getEntityFieldValueByName(entityFields, 'ExpenseClaimTitle');
    cardFields.push({
      displayData: this.idLabel + ' ' + expenseClaimId + (expenseClaimTitle && expenseClaimTitle.length ? ' - ' + expenseClaimTitle : ''),
      fieldName: '',
      fieldType: ActivityCardConfig.Expense.ClaimTitle.fieldType,
      slotId: ActivityCardConfig.Expense.ClaimTitle.slotId
    });

    return cardFields;
  }

  public initializeOrganizationFields(entityFields: Array<ActivityEntityField>): Array<ActivityCardField> {
    const cardFields: Array<ActivityCardField> = [];
    for (const field of entityFields) {
      if (ActivityCardConfig.Organization.hasOwnProperty(field.Name)) {
        cardFields.push({
          displayData: field.Value,
          fieldName: field.Name,
          fieldType: ActivityCardConfig.Organization[field.Name].fieldType,
          slotId: ActivityCardConfig.Organization[field.Name].slotId
        });
      }
    }

    cardFields.push({
      displayData: this.idLabel,
      fieldName: '',
      fieldType: ActivityCardConfig.Organization.IdLabel.fieldType,
      slotId: ActivityCardConfig.Organization.IdLabel.slotId
    });

    return cardFields;
  }

  public initializePaymentFields(entityFields: Array<ActivityEntityField>): Array<ActivityCardField> {
    const cardFields: Array<ActivityCardField> = [];
    for (const field of entityFields) {
      if (ActivityCardConfig.Payment.hasOwnProperty(field.Name)) {
        cardFields.push({
          displayData: field.Value,
          fieldName: field.Name,
          fieldType: ActivityCardConfig.Payment[field.Name].fieldType,
          slotId: ActivityCardConfig.Payment[field.Name].slotId
        });
      }
    }

    cardFields.push({
      displayData: this.getDate(entityFields, 'PaymentDate'),
      fieldName: '',
      fieldType: ActivityCardConfig.Payment.PaymentDate.fieldType,
      slotId: ActivityCardConfig.Payment.PaymentDate.slotId
    });

    return cardFields;
  }

  public initializePeopleFields(profileTypeId: number, entityFields: Array<ActivityEntityField>): Array<ActivityCardField> {
    const profileTypesOrgNotApplicable = [PhxConstants.ProfileType.WorkerTemp, PhxConstants.ProfileType.WorkerCanadianSP, PhxConstants.ProfileType.WorkerUnitedStatesW2];
    const cardFields: Array<ActivityCardField> = [];
    for (const field of entityFields) {
      if (field.Name === 'OrganizationName' && field.Value == null) {
        const orgIsApplicable = entityFields.some(x => x.Name === 'ProfileTypeId' && !profileTypesOrgNotApplicable.includes(+x.Value));

        if (orgIsApplicable) {
          field.Value = this.userProfileNoOrganizationPlaceholder;
        }
      }

      if (ActivityCardConfig.People.hasOwnProperty(field.Name)) {
        cardFields.push({
          displayData: field.Value,
          fieldName: field.Name,
          fieldType: ActivityCardConfig.People[field.Name].fieldType,
          slotId: ActivityCardConfig.People[field.Name].slotId
        });
      }
    }

    cardFields.push({
      displayData: this.idLabel,
      fieldName: '',
      fieldType: ActivityCardConfig.People.IdLabel.fieldType,
      slotId: ActivityCardConfig.People.IdLabel.slotId
    });

    return cardFields;
  }

  public initializePaymentTransactionFields(entityFields: Array<ActivityEntityField>): Array<ActivityCardField> {
    const cardFields: Array<ActivityCardField> = [];
    for (const field of entityFields) {
      if (ActivityCardConfig.PaymentTransaction.hasOwnProperty(field.Name)) {
        cardFields.push({
          displayData: field.Value,
          fieldName: field.Name,
          fieldType: ActivityCardConfig.PaymentTransaction[field.Name].fieldType,
          slotId: ActivityCardConfig.PaymentTransaction[field.Name].slotId
        });
      }
    }

    const releaseDate = this.getDate(entityFields, 'ReleaseDate');
    const plannedReleaseDate = this.getDate(entityFields, 'PlannedReleaseDate');

    cardFields.push({
      displayData: releaseDate !== '' ? releaseDate : plannedReleaseDate !== '' ? plannedReleaseDate : '---',
      fieldName: '',
      fieldType: ActivityCardConfig.PaymentTransaction.ReleasedOrPlannedReleaseDate.fieldType,
      slotId: ActivityCardConfig.PaymentTransaction.ReleasedOrPlannedReleaseDate.slotId
    });

    return cardFields;
  }

  public getLocalizedEntityName(entityTypeId: number, pluralize: boolean = false) {
    if (entityTypeId > 0) {
      switch (entityTypeId) {
        case PhxConstants.EntityType.Organization:
          return this.localizationService.translate('activityCentre.header.organization' + (pluralize ? 'Plural' : ''));
        case PhxConstants.EntityType.TimeSheet:
          return this.localizationService.translate('activityCentre.header.timesheet' + (pluralize ? 'Plural' : ''));
        case PhxConstants.EntityType.WorkOrderVersion:
          return this.localizationService.translate('activityCentre.header.workOrder' + (pluralize ? 'Plural' : ''));
        case PhxConstants.EntityType.PaymentTransaction:
          return this.localizationService.translate('activityCentre.header.paymentTransaction' + (pluralize ? 'Plural' : ''));
        case PhxConstants.EntityType.Payment:
          return this.localizationService.translate('activityCentre.header.payment' + (pluralize ? 'Plural' : ''));
        case PhxConstants.EntityType.UserProfile:
          return this.localizationService.translate('activityCentre.header.profile' + (pluralize ? 'Plural' : ''));
        case PhxConstants.EntityType.ComplianceDocument:
          return this.localizationService.translate('activityCentre.header.document' + (pluralize ? 'Plural' : ''));
        case PhxConstants.EntityType.ExpenseClaim:
          return this.localizationService.translate('activityCentre.header.expense' + (pluralize ? 'Plural' : ''));
        default:
          return 'Missing Entity Localization';
      }
    } else {
      return 'Invalid Entity Type';
    }
  }

  private getEntityFieldValueByName(entityFields: Array<ActivityEntityField>, fieldName: string) {
    const field = entityFields && entityFields.length ? entityFields.find(f => f.Name === fieldName) : null;
    return field ? field.Value : null;
  }
}
