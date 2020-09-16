// angular
import { Component, OnInit, ViewChild, Input, SimpleChanges, OnChanges, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, filter, first, findLastIndex, find, indexOf, cloneDeep, sortBy } from 'lodash';
import * as moment from 'moment';
import { HashModel } from '../../common/utility/hash-model';
// common
import { FormGroup, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { NavigationService } from './../../common/services/navigation.service';
import { UserProfile } from '../../common/model/user';
import { CustomFieldService, PhxConstants, CommonService, DialogService } from '../../common';
import { CodeValueGroups } from './../../common/model/phx-code-value-groups';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { IRouterState } from '../../common/state/router/reducer';
import { NavigationBarItem, StateAction, StateActionButtonsOption, OnClickStateActionOption, StateActionButtonStyle, StateActionDisplayType } from '../../common/model';
import { LoadingSpinnerService } from './../../common/loading-spinner/service/loading-spinner.service';
// workorder
import { IVersion, IWorkOrder, IWorkOrderDto, WorkorderAction } from '../state/index';
import { CodeValueService } from '../../common/services/code-value.service';
import { WorkorderObservableService } from '../state/workorder.observable.service';
import {
  IReadOnlyStorage,
  IRoot,
  IFormGroupSetup,
  IPaymentInfo,
  IWorkOrderVersion,
  IBillingInfo
} from './../state/workorder.interface';
import { WorkorderTabCoreComponent } from './../workorder-tab-core/workorder-tab-core.component';
import { WorkOrdernWorkflowComponent } from './../workorder-workflow/workorder-workflow.component';
import { WorkorderTabTimeMaterialAndInvoiceComponent } from '../workorder-tab-time-material/workorder-tab-time-material.component';
import { WorkorderTabExpenseInvoiceComponent } from '../workorder-tab-expense-invoice/workorder-tab-expense-invoice.component';
import { WorkorderTabTaxesComponent } from '../workorder-tab-taxes/workorder-tab-taxes.component';
import { WorkorderTabPartiesComponent } from '../workorder-tab-parties/workorder-tab-parties.component';
import { WorkorderTabEarningsDeductionsComponent } from '../workorder-tab-earnings-deduction/workorder-tab-earnings-deduction.component';
import { WorkorderTabEarningsAndDeductionSafetyInsuranceComponent } from './../workorder-tab-earnings-and-deduction-safety-insurance/workorder-tab-earnings-and-deduction-safety-insurance.component';
import { WorkorderService } from '../workorder.service';
import { ControlFieldAccessibility } from './../control-field-accessibility';
import { WorkorderPaymentInvoicesComponent } from '../workorder-payment-invoices/workorder-payment-invoices.component';
import { AuthService } from '../../common/services/auth.service';
import { ClientSpecificFieldsService } from '../../client-specific-fields/client-specific-fields.service';
import { IOrganization } from './../../organization/state/organization.interface';

@Component({
  selector: 'app-workorder',
  templateUrl: './workorder.component.html'
})
export class WorkorderComponent extends BaseComponentActionContainer implements OnInit, OnChanges {
  @ViewChild('workFlow')
  workOrderWorkflow: WorkOrdernWorkflowComponent;

  public Id: number;
  public selectedCounter: number;
  public workOrder: IWorkOrder;
  public readOnlyStorage: IReadOnlyStorage = null;
  public rootFormGroup: FormGroup<IRoot>;
  public routerParams: any;
  currentProfile: UserProfile;
  formGroupSetup: IFormGroupSetup;
  syncFromATS: boolean;
  effectiveToDate: string;
  showClientSpecificFields: boolean = false;
  stateActions: StateAction[];
  listOrganizationClient: Array<IOrganization>;

  html: {
    navigationBarContent: Array<NavigationBarItem>;
    codeValueGroups: any;
    phxConstants: typeof PhxConstants;
    validationMessages: Array<any>;
    versionsOrdered: Array<IVersion>;
    codeValueLists: {};
    commonLists: {};
    list: {
      workOrderVersionStatuses: Array<any>;
      workOrders: Array<{
        workOrder: IWorkOrderDto;
        counter: number;
        text: string;
      }>;
    };
    access: {};
  } = {
    navigationBarContent: null,
    codeValueGroups: null,
    phxConstants: PhxConstants,
    validationMessages: [],
    versionsOrdered: null,
    codeValueLists: {},
    commonLists: {},
    list: {
      workOrderVersionStatuses: [],
      workOrders: []
    },
    access: {}
  };

  CurrentWorkOrderVersionId: number;
  WorkOrderIndex: number = 0;
  ProfileTypeId: number;
  @Input() routerState: any;
  @Input() showTemplate: boolean = false;

  constructor(
    private navigationService: NavigationService,
    private workorderObservableService: WorkorderObservableService,
    private formBuilder: FormBuilder,
    private customFieldService: CustomFieldService,
    private codeValueService: CodeValueService,
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private workOrderService: WorkorderService,
    private authService: AuthService,
    private clientSpecificFieldsService: ClientSpecificFieldsService,
    private dialogService: DialogService,
    private loadingSpinnerService: LoadingSpinnerService,
    private changeRef: ChangeDetectorRef
  ) {
    super();
    this.getProfile();
    console.log(this.constructor.name + '.constructor');
    this.html.phxConstants = PhxConstants;
    this.html.codeValueGroups = this.commonService.CodeValueGroups;
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
  }

  ngOnInit(): void {
    this._initStateActions();
    this.authService
      .getCurrentProfile()
      .takeUntil(this.isDestroyed$)
      .subscribe(profile => {
        this.ProfileTypeId = profile.ProfileTypeId;
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.routerState && changes.routerState.currentValue) {
      this.routerState = changes.routerState.currentValue;
      this.routerParams = this.routerState.params;
      if (this.routerState.location.includes(PhxConstants.WorkorderNavigationName.core)) {
        this.setRouterState(this.routerState, PhxConstants.WorkorderNavigationName.core);
      } else if (this.routerState.location.includes(PhxConstants.WorkorderNavigationName.parties)) {
        this.setRouterState(this.routerState, PhxConstants.WorkorderNavigationName.parties);
      } else if (this.routerState.location.includes(PhxConstants.WorkorderNavigationName.timematerialinvoice)) {
        this.setRouterState(this.routerState, PhxConstants.WorkorderNavigationName.timematerialinvoice);
      } else if (this.routerState.location.includes(PhxConstants.WorkorderNavigationName.expensemanagement)) {
        this.setRouterState(this.routerState, PhxConstants.WorkorderNavigationName.expensemanagement);
      } else if (this.routerState.location.includes(PhxConstants.WorkorderNavigationName.purchaseorder)) {
        this.setRouterState(this.routerState, PhxConstants.WorkorderNavigationName.purchaseorder);
      } else if (this.routerState.location.includes(PhxConstants.WorkorderNavigationName.earningsanddeductions)) {
        this.setRouterState(this.routerState, PhxConstants.WorkorderNavigationName.earningsanddeductions);
      } else if (this.routerState.location.includes(PhxConstants.WorkorderNavigationName.taxes)) {
        this.setRouterState(this.routerState, PhxConstants.WorkorderNavigationName.taxes);
      } else if (this.routerState.location.includes(PhxConstants.WorkorderNavigationName.compliancedocuments)) {
        this.setRouterState(this.routerState, PhxConstants.WorkorderNavigationName.compliancedocuments);
      } else if (this.routerState.location.includes(PhxConstants.WorkorderNavigationName.clientspecificfields)) {
        this.setRouterState(this.routerState, PhxConstants.WorkorderNavigationName.clientspecificfields);
      } else if (this.routerState.location.includes(PhxConstants.WorkorderNavigationName.activity)) {
        this.setRouterState(this.routerState, PhxConstants.WorkorderNavigationName.activity);
      } else {
        const navigateTo = () => {
          const navigatePath = `/home`;
          this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
            console.error(`app-organization: error navigating to home`, err);
          });
        };
        navigateTo();
        this.commonService.logError('Cannot match any routes');
      }
      ControlFieldAccessibility.routerState = this.routerState;
      this.getWorkorder();
    }
  }

  getWorkorder() {
    this.workorderObservableService
      .workorder$(this, this.routerParams, <boolean>this.showTemplate)
      .takeUntil(this.isDestroyed$)
      .subscribe((workorder: IWorkOrder) => {
        const workorderVersionId = workorder && workorder.WorkOrderVersion ? workorder.WorkOrderVersion.Id : null;
        if (workorderVersionId !== null) {
          !this.showTemplate ? this.navigationService.setTitle('workorder-viewedit', [`${workorder.AssignmentId}.${workorder.WorkOrderVersion.WorkOrderNumber}`]) : this.navigationService.setTitle('workorder-template-viewedit');

          if (workorderVersionId !== this.CurrentWorkOrderVersionId) {
            this.setValidationMessages();
            this.IsClientSpecificFieldsIncluded(workorder);
            this.selectedCounter = workorder.WorkOrderVersion.WorkOrderNumber;
            this.WorkOrderIndex = this.getWorkOrderIndexById(workorder.RootObject.WorkOrders, workorder.WorkOrderId);
          }
          this.workOrder = workorder;
          ControlFieldAccessibility.workorder = this.workOrder;
          this.onInitWorkorder(workorder);
          this.syncFromATS =
            this.workOrder.AtsPlacementId > 0 &&
            this.workOrder.WorkOrderVersion.IsDraftStatus &&
            findLastIndex(this.workOrder.RootObject.WorkOrders, function(wo) {
              return wo.StatusId === PhxConstants.WorkOrderStatus.Processing || wo.StatusId === PhxConstants.WorkOrderStatus.ChangeInProgress;
            }) === this.WorkOrderIndex;
          if (!this.showTemplate) {
            this.effectiveToDateCalc();
          }
        }
        this.CurrentWorkOrderVersionId = workorderVersionId;
      });
  }

  setRouterState(routerStateResult: IRouterState, WorkorderNavigationName: string) {
    this.routerState = {
      Id: routerStateResult.params.workOrderId,
      routerPath: WorkorderNavigationName,
      url: routerStateResult.location
    };
  }

  getLastPartOfUrl() {
    const url = window.location.href;
    const parts = url.split('/').reverse()[0];
    return parts;
  }

  onInitWorkorder(workOrder: any) {
    console.log(this.constructor.name + '.onInitWorkorder()');
    if (!this.showTemplate) {
      this.html.list.workOrderVersionStatuses = this.codeValueService.getCodeValues(this.html.codeValueGroups.WorkOrderVersionStatus, true);
      this.html.list.workOrders = map(this.workOrder.RootObject.WorkOrders, (workorder: IWorkOrderDto) => {
        return {
          workOrder: workorder,
          counter: workorder.WorkOrderNumber,
          text: '#' + workorder.WorkOrderNumber
        };
      });
      this.html.versionsOrdered = this.workOrderService.getWorkOrderVersionsOrdered(this.workOrder);
    }
    this.readOnlyStorage = workOrder.readOnlyStorage;
    this.formBuilderGroupSetup(this.formGroupSetup, workOrder, this.workorderObservableService);
    setTimeout(() => (this.html.navigationBarContent = this.navigationBarContentSetup()));
  }

  navigationBarContentSetup(): Array<NavigationBarItem> {
    let path: string;
    if (this.showTemplate) {
      path = `/next/template/${this.routerParams.templateId}/`;
    } else {
      path = `/next/workorder/${this.routerParams.assignmentId}/${this.routerParams.workorderId}/${this.routerParams.versionId}/`;
    }
    return cloneDeep([
      {
        Id: 1,
        IsDefault: true,
        IsHidden: false,
        Valid: !this.showTemplate ? this.rootFormGroup.controls.TabCore.valid : true,
        Name: PhxConstants.WorkorderNavigationName.core,
        Path: path + PhxConstants.WorkorderNavigationName.core,
        DisplayText: 'Core'
        // , Icon: 'fontello-icon-doc-7',
      },
      {
        Id: 2,
        IsDefault: false,
        IsHidden: false,
        Valid: !this.showTemplate ? this.rootFormGroup.controls.TabParties.valid : true,
        Name: PhxConstants.WorkorderNavigationName.parties,
        Path: path + PhxConstants.WorkorderNavigationName.parties,
        DisplayText: 'Parties And Rates'
        //  , Icon: 'fontello-icon-network'
      },
      {
        Id: 3,
        IsDefault: false,
        IsHidden: false,
        Valid: !this.showTemplate ? this.rootFormGroup.controls.TabTimeMaterialInvoice.valid : true,
        Name: PhxConstants.WorkorderNavigationName.timematerialinvoice,
        Path: path + PhxConstants.WorkorderNavigationName.timematerialinvoice,
        DisplayText: 'Time & Material And Invoice'
      },
      {
        Id: 4,
        IsDefault: false,
        IsHidden: false,
        Valid: !this.showTemplate ? this.rootFormGroup.controls.TabExpenseInvoice.valid : true,
        Name: PhxConstants.WorkorderNavigationName.expensemanagement,
        Path: path + PhxConstants.WorkorderNavigationName.expensemanagement,
        DisplayText: 'Expense And Invoice'
      },
      {
        Id: 5,
        IsDefault: false,
        // IsHidden: !readOnlyStorage.IsEditable,
        Valid: true,
        Name: PhxConstants.WorkorderNavigationName.purchaseorder,
        Path: path + PhxConstants.WorkorderNavigationName.purchaseorder,
        DisplayText: 'Purchase Order'
        // , Icon: 'fontello-icon-money'
      },
      {
        Id: 6,
        IsDefault: false,
        // IsHidden: !readOnlyStorage.IsEditable,
        Valid: !this.showTemplate ? this.rootFormGroup.controls.TabEarningsAndDeductions.valid : true,
        Name: PhxConstants.WorkorderNavigationName.earningsanddeductions,
        Path: path + PhxConstants.WorkorderNavigationName.earningsanddeductions,
        DisplayText: 'Earnings and Deductions'
        // , Icon: 'fontello-icon-hammer'
      },
      {
        Id: 7,
        IsDefault: false,
        // IsHidden: !readOnlyStorage.IsEditable,
        Valid: !this.showTemplate ? this.rootFormGroup.controls.TabTaxes.valid : true,
        Name: PhxConstants.WorkorderNavigationName.taxes,
        Path: path + PhxConstants.WorkorderNavigationName.taxes,
        DisplayText: 'Taxes'
        // , Icon: 'fontello-icon-hammer'
      },
      {
        Id: 8,
        IsDefault: false,
        IsHidden: this.showTemplate,
        Valid: true,
        Name: PhxConstants.WorkorderNavigationName.compliancedocuments,
        Path: path + PhxConstants.WorkorderNavigationName.compliancedocuments,
        DisplayText: 'Documents'
        // , Icon: 'fontello-icon-hammer'
      },
      {
        Id: 10,
        IsDefault: false,
        IsHidden: this.showTemplate || !this.showClientSpecificFields,
        Valid: true,
        Name: PhxConstants.WorkorderNavigationName.clientspecificfields,
        Path: path + PhxConstants.WorkorderNavigationName.clientspecificfields,
        DisplayText: 'Client Specific Fields'
        // , Icon: 'fontello-icon-hammer'
      },
      {
        Id: 9,
        IsDefault: false,
        IsHidden: this.showTemplate,
        Valid: true,
        Name: PhxConstants.WorkorderNavigationName.activity,
        Path: path + PhxConstants.WorkorderNavigationName.activity,
        DisplayText: 'Activity'
        // , Icon: 'fontello-icon-hammer'
      }
    ]);
  }

  onNotesHeaderClicked($event) {
    const navigatePath = `/next/workorder/${this.routerParams.assignmentId}/${this.routerParams.workorderId}/${this.routerParams.versionId}/${this.html.phxConstants.WorkorderNavigationName.notes}`;

    this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
      console.error(
        `app-workorder: error navigating to /${this.routerParams.assignmentId}/${this.routerParams.workorderId}/
      ${this.routerParams.versionId}/${this.html.phxConstants.WorkorderNavigationName.notes}`,
        err
      );
    });
  }

  onWorkorderChange(event) {
    if (event && (event.value !== this.selectedCounter || event.value !== event.previousValue)) {
      const woData = this.html.list.workOrders.find(a => a.counter === event.value);
      if (woData == null) {
        return;
      }
      const workOrder: any = woData.workOrder;
      let versionId: number;
      const activeWorkOrderVersion = filter(workOrder.WorkOrderVersions, (res: any) => {
        return res.StatusId === this.html.phxConstants.WorkOrderVersionStatus.Approved;
      });
      const len = activeWorkOrderVersion.length - 1;
      let version: any;
      if (len === -1) {
        version = first(workOrder.WorkOrderVersions);
      } else {
        version = activeWorkOrderVersion[len];
      }
      if (version) {
        versionId = version.Id;
      }
      this.routerParams = {
        assignmentId: workOrder.AssignmentId,
        tabId: this.routerParams.tabId,
        versionId: versionId,
        workorderId: workOrder.Id
      };

      if (this.routerParams.tabId) {
        this.navigationTo();
      }
    }
  }

  fixTabId() {
    if (this.routerParams.tabId && this.routerParams.tabId !== 'activity') {
      return this.routerParams.tabId;
    } else if (this.routerState.url.includes('/activity')) {
      switch (this.getLastPartOfUrl()) {
        case 'notes':
          return PhxConstants.WorkorderNavigationName.notes;
        case 'history':
          return PhxConstants.WorkorderNavigationName.history;
        case 'documents':
          return PhxConstants.WorkorderNavigationName.documents;
        case 'transaction':
          return PhxConstants.WorkorderNavigationName.transaction;
        case 'workflow':
          return PhxConstants.WorkorderNavigationName.workflow;
        default:
          return PhxConstants.WorkorderNavigationName.notes;
      }
    }
  }

  navigationTo() {
    const navigateCommand = ['/next/workorder', this.routerParams.assignmentId, this.routerParams.workorderId, this.routerParams.versionId, this.fixTabId()];
    const navigationExtras = { relativeTo: this.activatedRoute };
    this.router
      .navigate(navigateCommand, navigationExtras)
      .catch(err => {
        console.error(this.constructor.name + '.error in router.navigate: ', navigateCommand, navigationExtras, err);
      })
      .then(r => {
        console.log(this.constructor.name + '.success: ', navigateCommand, navigationExtras);
      });
  }

  onVersionClick(version) {
    this.routerParams.versionId = Number(version.Id);
    this.navigationTo();
  }

  async onClickStateAction(action: StateAction, componentOption: StateActionButtonsOption, actionOption: OnClickStateActionOption) {
    if (action.commandName === PhxConstants.CommandNamesSupportedByUi.WorkOrderActionCommand.WorkOrderDiscardChanges) {
      this.stateService.dispatchOnAction(new WorkorderAction.WorkorderRefresh(this.workOrder.WorkOrderVersion.Id));
      return;
    }
    await this.onOutputEvent();
    this.workOrderWorkflow.onClickStateAction(action, componentOption, actionOption, this.workOrder);
  }

  public getProfile() {
    this.currentProfile = WorkOrdernWorkflowComponent.currentProfile;
  }

  workOrderTemplateSave() {
    const templateBody: any = {
      Id: 0,
      OrganizationCode: this.workOrder.RootObject.OrganizationCode,
      OrganizationIdInternal: this.workOrder.RootObject.OrganizationIdInternal,
      StatusId: this.workOrder.RootObject.StatusId,
      UserProfileIdWorker: this.workOrder.RootObject.UserProfileIdWorker,
      WorkOrders: [{ ...this.workOrder, Id: this.workOrder.WorkOrderId, WorkOrderVersions: [{ ...this.workOrder.WorkOrderVersion }] }]
    };

    const updateTemplateBody = {
      TemplateId: this.workOrder.TemplateId,
      TemplateBody: templateBody,
      LastModifiedDatetime: this.workOrder.RootObject.LastModifiedDateTime
    };

    this.workOrderService.updateTemplateBody(updateTemplateBody).subscribe(
      (response: any) => {
        this.commonService.logSuccess('Work Order Template Updated');
      },
      error => {
        const validationMessages = this.commonService.parseResponseError(error);
        if (validationMessages.length > 0) {
          validationMessages.forEach(element => {
            this.html.validationMessages.push(element.Message);
          });
        }
      }
    );
  }

  getWorkOrderIndexById(workOrders: any, workOrderId: number) {
    let workOrderIndex = 0;
    if (workOrders && workOrderId && workOrders.length > 0) {
      const workOrder = find(workOrders, function(data) {
        return data.Id === workOrderId;
      });
      workOrderIndex = indexOf(workOrders, workOrder);
    }
    if (workOrderIndex < 0) {
      workOrderIndex = 0;
    }
    return workOrderIndex;
  }

  formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, workorder: IWorkOrder, workorderObservableService: WorkorderObservableService) {
    const contacts = WorkorderPaymentInvoicesComponent.formBuilderGroupSetupPaymentContacts(formGroupSetup, workorder);
    this.rootFormGroup = formGroupSetup.formBuilder.group<IRoot>({
      Id: [workorder.Id],
      EffectiveDate: [workorder.WorkOrderVersion.EffectiveDate],
      PaymentContacts: contacts,
      TabCore: WorkorderTabCoreComponent.formBuilderGroupSetup(formGroupSetup, workorder),
      TabParties: WorkorderTabPartiesComponent.formBuilderGroupSetup(formGroupSetup, workorder, workorderObservableService),
      TabTimeMaterialInvoice: WorkorderTabTimeMaterialAndInvoiceComponent.formBuilderGroupSetup(formGroupSetup, workorder, workorderObservableService, contacts),
      TabExpenseInvoice: WorkorderTabExpenseInvoiceComponent.formBuilderGroupSetup(formGroupSetup, workorder, workorderObservableService, contacts),
      TabTaxes: WorkorderTabTaxesComponent.formBuilderGroupSetup(formGroupSetup, workorder),
      TabEarningsAndDeductions: WorkorderTabEarningsDeductionsComponent.formBuilderGroupSetup(formGroupSetup, workorder, workorderObservableService)
    });

    /*
      The code below solves the exception when runing in develop mode.
      Commented out because it adds lots of overhead and the exception won't be thrown in production mode.

      Exception:
      ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value: 'ng-untouched: true'. Current value: 'ng-untouched: false'.
    */
    // this.rootFormGroup.valueChanges.takeUntil(this.isDestroyed$).subscribe(() => {
    //   this.changeRef.detectChanges();
    // });
  }

  onEffectiveDateValueChanged() {
    setTimeout(() => this.onOutputEvent(), 0);
  }

  async onOutputEvent(isTabParties = false) {
    const workOrderVersion = this.workOrder ? this.workOrder.WorkOrderVersion : null;
    const oldWorksiteId = workOrderVersion ? workOrderVersion.WorksiteId : null;
    const oldSubdivisionIdSalesTax = workOrderVersion && workOrderVersion.BillingInfoes && workOrderVersion.BillingInfoes[0] ? workOrderVersion.BillingInfoes[0].SubdivisionIdSalesTax : null;
    const oldPaymentInfos =
      workOrderVersion && workOrderVersion.PaymentInfoes && workOrderVersion.PaymentInfoes.length
        ? workOrderVersion.PaymentInfoes.map(paymentInfo => {
            return {
              Id: paymentInfo.Id,
              SubdivisionIdSalesTax: paymentInfo.SubdivisionIdSalesTax
            };
          })
        : [];

    this.workOrder.WorkOrderVersion.EffectiveDate = this.rootFormGroup.value.EffectiveDate;
    if (isTabParties) {
      this.workOrder = { ...WorkorderTabPartiesComponent.formGroupToPartial(this.workOrder, this.rootFormGroup) };
    } else {
      this.workOrder = WorkorderTabCoreComponent.formGroupToPartial(this.workOrder, this.rootFormGroup);
      this.workOrder = { ...WorkorderTabPartiesComponent.formGroupToPartial(this.workOrder, this.rootFormGroup) };
      this.workOrder = { ...WorkorderTabTimeMaterialAndInvoiceComponent.formGroupToPartial(this.workOrder, this.rootFormGroup) };
      this.workOrder = { ...WorkorderTabExpenseInvoiceComponent.formGroupToPartial(this.workOrder, this.rootFormGroup) };
      this.workOrder = WorkorderTabTaxesComponent.formGroupToPartial(this.workOrder, this.rootFormGroup);
      this.workOrder = WorkorderTabEarningsDeductionsComponent.formGroupToPartial(this.workOrder, <FormGroup<any>>this.rootFormGroup.controls.TabEarningsAndDeductions);
    }

    /*
      These onChange event carried over from AngularJS is here because they make API calls to update the work order model
      We need to capture the updates before dispatching WorkorderUpdate redux action...
    */
    const onChangePromises = [];
    if (oldWorksiteId !== this.workOrder.WorkOrderVersion.WorksiteId) {
      onChangePromises.push(this.onChangeWorksiteId(this.workOrder, oldWorksiteId));
      // worksite changes affects payment / billing infos; so no need to detect change event again
    } else {
      if (
        this.workOrder &&
        this.workOrder.WorkOrderVersion &&
        this.workOrder.WorkOrderVersion.BillingInfoes &&
        this.workOrder.WorkOrderVersion.BillingInfoes[0] &&
        this.workOrder.WorkOrderVersion.BillingInfoes[0].SubdivisionIdSalesTax !== oldSubdivisionIdSalesTax
      ) {
        onChangePromises.push(this.onChangeSubdivisionIdSalesTax(this.workOrder));
      }
      this.workOrder.WorkOrderVersion.PaymentInfoes.forEach((paymentInfo: IPaymentInfo) => {
        const old = oldPaymentInfos.find(oldPaymentInfo => oldPaymentInfo.Id === paymentInfo.Id);
        if (old && old.SubdivisionIdSalesTax !== paymentInfo.SubdivisionIdSalesTax) {
          onChangePromises.push(this.onChangePaymentSubdivisionIdSalesTax(this.workOrder, paymentInfo));
        }
      });
    }
    if (onChangePromises.length) {
      this.loadingSpinnerService.show();
      await Promise.all(onChangePromises);
      this.loadingSpinnerService.hide();
    }

    this.stateService.dispatchOnAction(
      new WorkorderAction.WorkorderUpdate({
        ...this.workOrder
      })
    );
  }

  public setValidationMessages(messages = null) {
    if (messages) {
      this.html.validationMessages = messages;
    } else {
      this.html.validationMessages = [];
    }
  }

  onChangeClientSpecificFields(event) {
    this.workOrder.WorkOrderVersion.ClientBasedEntityCustomFieldValue = event;
  }

  public checkPtFiledAccessibility(modelPrefix, fieldName, modelValidators = null) {
    return ControlFieldAccessibility.ptFieldViewEventOnChangeStatusId(modelPrefix, fieldName, modelValidators, this.authService);
  }

  public effectiveToDateCalc() {
    const currentWorkOrder = this.workOrder.RootObject.WorkOrders.find(i => i.Id === +this.routerParams.workorderId);
    const activeVersions = filter(currentWorkOrder.WorkOrderVersions, function(wov) {
      return wov.StatusId === PhxConstants.WorkOrderVersionStatus.Approved;
    });
    const sortedActiveVersions = sortBy(activeVersions, 'EffectiveDate');
    const idx = sortedActiveVersions.findIndex(i => i.Id === this.workOrder.WorkOrderVersion.Id);
    if (idx >= 0) {
      if (idx === sortedActiveVersions.length - 1) {
        this.effectiveToDate = currentWorkOrder.EndDate;
      } else {
        if (sortedActiveVersions.length > idx) {
          const eD = moment(sortedActiveVersions[idx + 1].EffectiveDate);
          this.effectiveToDate = eD.subtract(1, 'd').toString();
        }
      }
    }
  }

  public IsClientSpecificFieldsIncluded(workOrder: IWorkOrder) {
    const clientId = workOrder.WorkOrderVersion.BillingInfoes[0].OrganizationIdClient;
    const entityId = workOrder.WorkOrderVersion.Id;
    const entityTypeId = PhxConstants.EntityType.WorkOrderVersion;
    if (entityId != null) {
      this.clientSpecificFieldsService.getCustomFields(clientId, entityId, entityTypeId).then((customFields: any) => {
        if (!(customFields && customFields.length === 0)) {
          this.showClientSpecificFields = true;
        }
      });
    }
  }

  private shouldHideReactivate(): boolean {
    if (this.workOrder.StatusId === PhxConstants.WorkOrderStatus.Complete && this.workOrder.WorkOrderVersion.StatusId !== PhxConstants.WorkOrderVersionStatus.Approved) {
      return true;
    }
    return false;
  }

  private shouldHideResync(): boolean {
    if (!this.workOrder || !(this.syncFromATS && this.ProfileTypeId === PhxConstants.UserProfileType.Internal) || this.workOrder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.Declined) {
      return true;
    }
    return false;
  }

  private shouldHideEdit(): boolean {
    if (this.workOrder.StatusId === PhxConstants.WorkOrderStatus.Terminated) {
      return true;
    }
    return false;
  }
  private shouldHideTransaction(): boolean {
    return false;
  }
  private shouldHideAdjustment(): boolean {
    return false;
  }

  private shouldHideExtend(): boolean {
    if (
      this.workOrder.StatusId === PhxConstants.WorkOrderStatus.Terminated ||
      this.workOrder.StatusId === PhxConstants.WorkOrderStatus.Processing ||
      (this.workOrder.StatusId === PhxConstants.WorkOrderStatus.ChangeInProgress && this.workOrder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.PendingUnterminate) ||
      (this.workOrder.StatusId === PhxConstants.WorkOrderStatus.Complete && this.workOrder.WorkOrderVersion.StatusId !== PhxConstants.WorkOrderVersionStatus.Approved)
    ) {
      return true;
    }
    return false;
  }

  private shouldHideTerminate(): boolean {
    if (this.workOrder.StatusId === PhxConstants.WorkOrderStatus.Active || this.workOrder.StatusId === PhxConstants.WorkOrderStatus.Complete) {
      if (this.workOrder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.Approved) {
        return false;
      }
    }

    return true;
  }

  _initStateActions() {
    this.stateActions = this.showTemplate
      ? [
          {
            displayText: 'Save Template',
            skipSecurityCheck: true,
            style: StateActionButtonStyle.PRIMARY,
            onClick: (action, componentOption, actionOption) => {
              this.workOrderTemplateSave();
            }
          }
        ]
      : [
          {
            actionId: PhxConstants.StateAction.AssignmentExtend,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            },
            hiddenFn: (action: StateAction, componentOption: StateActionButtonsOption) => {
              if (componentOption.displayType !== StateActionDisplayType.DROPDOWN) {
                return true;
              } else {
                return this.shouldHideExtend();
              }
            }
          },
          {
            actionId: PhxConstants.StateAction.WorkOrderScheduleChange,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            },
            hiddenFn: (action: StateAction, componentOption: StateActionButtonsOption) => componentOption.displayType !== StateActionDisplayType.DROPDOWN
          },
          {
            actionId: PhxConstants.StateAction.WorkOrderStopPayment,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            },
            hiddenFn: (action: StateAction, componentOption: StateActionButtonsOption) => !this.workOrder || this.workOrder.IsPaymentStopped || componentOption.displayType !== StateActionDisplayType.DROPDOWN
          },
          {
            actionId: PhxConstants.StateAction.WorkOrderResumePayment,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            },
            hiddenFn: (action: StateAction, componentOption: StateActionButtonsOption) => !this.workOrder || !this.workOrder.IsPaymentStopped || componentOption.displayType !== StateActionDisplayType.DROPDOWN
          },
          {
            actionId: PhxConstants.StateAction.WorkOrderReactivate,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            },
            hiddenFn: (action: StateAction, componentOption: StateActionButtonsOption) => {
              if (componentOption.displayType !== StateActionDisplayType.DROPDOWN) {
                return true;
              } else {
                return this.shouldHideReactivate();
              }
            }
          },
          {
            actionId: PhxConstants.StateAction.WorkOrderCreateTransaction,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            },
            hiddenFn: (action: StateAction, componentOption: StateActionButtonsOption) => {
              if (componentOption.displayType !== StateActionDisplayType.DROPDOWN) {
                return true;
              } else {
                return this.shouldHideTransaction();
              }
            }
          },
          {
            actionId: PhxConstants.StateAction.WorkOrderReleaseVacationPay,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            },
            hiddenFn: (action: StateAction, componentOption: StateActionButtonsOption) =>
              !this.workOrder || PhxConstants.UserProfileType.WorkerTemp !== this.workOrder.workerProfileTypeId || componentOption.displayType !== StateActionDisplayType.DROPDOWN
          },
          {
            actionId: PhxConstants.StateAction.WorkOrderCreateGovernmentAdjustment,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            },
            hiddenFn: (action: StateAction, componentOption: StateActionButtonsOption) => {
              if (componentOption.displayType !== StateActionDisplayType.DROPDOWN) {
                return true;
              } else {
                return this.shouldHideAdjustment();
              }
            }
          },
          {
            actionId: PhxConstants.StateAction.WorkOrderVersionSubmit,
            style: StateActionButtonStyle.PRIMARY,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            },
            disabledFn: (action: StateAction, componentOption: StateActionButtonsOption) => !this.rootFormGroup.valid
          },
          {
            actionId: PhxConstants.StateAction.WorkOrderVersionFinalize,
            style: StateActionButtonStyle.PRIMARY,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            },
            disabledFn: (action: StateAction, componentOption: StateActionButtonsOption) => !this.rootFormGroup.valid
          },
          {
            actionId: PhxConstants.StateAction.WorkOrderVersionApprove,
            style: StateActionButtonStyle.PRIMARY,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            }
          },
          {
            actionId: PhxConstants.StateAction.WorkOrderVersionDecline,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            },
            showDeclinedCommentDialog: true
          },
          {
            actionId: PhxConstants.StateAction.WorkOrderVersionDeclineActivation,
            showDeclinedCommentDialog: true,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            }
          },
          {
            actionId: PhxConstants.StateAction.WorkOrderVersionSave,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            }
          },
          {
            actionId: PhxConstants.StateAction.WorkOrderVersionRecallToCompliance,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            }
          },
          {
            actionId: PhxConstants.StateAction.WorkOrderVersionRecallToDraft,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            }
          },
          {
            actionId: PhxConstants.StateAction.WorkOrderVersionEdit,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            },
            hiddenFn: (action: StateAction, componentOption: StateActionButtonsOption) => {
              if (componentOption.displayType !== StateActionDisplayType.DROPDOWN) {
                return true;
              } else {
                return this.shouldHideEdit();
              }
            }
          },
          {
            actionId: PhxConstants.StateAction.WorkOrderTerminate,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            },
            hiddenFn: (action: StateAction, componentOption: StateActionButtonsOption) => {
              if (componentOption.displayType !== StateActionDisplayType.DROPDOWN) {
                return true;
              } else {
                return this.shouldHideTerminate();
              }
            }
          },
          {
            actionId: PhxConstants.StateAction.WorkOrderUnterminate,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            },
            hiddenFn: (action: StateAction, componentOption: StateActionButtonsOption) => componentOption.displayType !== StateActionDisplayType.DROPDOWN
          },
          {
            actionId: PhxConstants.StateAction.WorkOrderVersionApproveReactivation,
            style: StateActionButtonStyle.PRIMARY,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            }
          },
          {
            actionId: PhxConstants.StateAction.WorkOrderVersionDiscard,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            },
            hiddenFn: (action: StateAction, componentOption: StateActionButtonsOption) => componentOption.displayType !== StateActionDisplayType.DROPDOWN
          },
          {
            displayText: 'Save as a Template',
            commandName: PhxConstants.CommandNamesSupportedByUi.WorkOrderActionCommand.workOrderSaveAsTemplate,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            },
            hiddenFn: (action: StateAction, componentOption: StateActionButtonsOption) => !this.workOrder || componentOption.displayType !== StateActionDisplayType.DROPDOWN
          },
          {
            displayText: 'Cancel',
            commandName: PhxConstants.CommandNamesSupportedByUi.WorkOrderActionCommand.WorkOrderDiscardChanges,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            },
            hiddenFn: (action: StateAction, componentOption: StateActionButtonsOption) => {
              return !this.workOrder || !(this.workOrder.WorkOrderVersion.IsDraftStatus && this.workOrder.combinedAvailableStateActions.includes(PhxConstants.StateAction.WorkOrderVersionSave));
            }
          },
          {
            actionId: PhxConstants.StateAction.WorkOrderVersionReSyncATS,
            onClick: (action, componentOption, actionOption) => {
              this.onClickStateAction(action, componentOption, actionOption);
            },
            hiddenFn: (action: StateAction, componentOption: StateActionButtonsOption) => {
              if (componentOption.displayType !== StateActionDisplayType.DROPDOWN) {
                return true;
              } else {
                return this.shouldHideResync();
              }
            }
          }
        ];
  }

  /*
    converted from AssignmentAddRemoveSubentitiesController.js -- onChangeCurrentWorkOrderVersionWorksiteId
  */
  async onChangeWorksiteId(workOrder: IWorkOrder, oldWorksiteId: number): Promise<void> {
    const workOrderVersion: IWorkOrderVersion = workOrder ? workOrder.WorkOrderVersion : null;
    if (workOrderVersion) {
      const worksiteChangedMessage = [];
      const billingInfo = workOrderVersion.BillingInfoes ? workOrderVersion.BillingInfoes[0] : null;
      const organizationClientSalesTaxDefaultId = billingInfo ? billingInfo.OrganizationClientSalesTaxDefaultId : null;
      const subdivisionIdSalesTax = billingInfo ? billingInfo.SubdivisionIdSalesTax : null;
      const worksiteId = workOrderVersion.WorksiteId;
      const subdivisionIdByWorksite = this.workOrderService.getSubdivisionIdByWorksiteId(worksiteId);

      if (worksiteId && subdivisionIdByWorksite) {
        if (organizationClientSalesTaxDefaultId === PhxConstants.ClientSalesTaxDefault.HeadOffice) {
          //  http://webdr01:8080/tfs/DefaultCollection/Phoenix_Oppenheimer/_workitems?id=6312
          //  when organizationClient is head office, then any changes of Worksite will NOT effect any messages or changes of billingInfo.SubdivisionIdSalesTax
        } else {
          if (subdivisionIdSalesTax) {
            if (subdivisionIdSalesTax !== subdivisionIdByWorksite) {
              const subdivisionByWorksiteName = this.codeValueService.getCodeValueText(subdivisionIdByWorksite, CodeValueGroups.Subdivision);
              const subdivisionSalesTaxName = this.codeValueService.getCodeValueText(subdivisionIdSalesTax, CodeValueGroups.Subdivision);
              worksiteChangedMessage.push('The Client Sales Tax Territory has been updated from "' + subdivisionSalesTaxName + '" to "' + subdivisionByWorksiteName + '"');

              billingInfo.SubdivisionIdSalesTax = subdivisionIdByWorksite;

              billingInfo.BillingSalesTaxes = await this.workOrderService.getBillingSalesTaxes(billingInfo, workOrder.OrganizationIdInternal);
            }
          } else {
            if (billingInfo.OrganizationIdClient) {
              await this.onChangeOrganizationIdClient(workOrder, billingInfo);
            } else {
              billingInfo.SubdivisionIdSalesTax = subdivisionIdByWorksite;
              billingInfo.BillingSalesTaxes = await this.workOrderService.getBillingSalesTaxes(billingInfo, workOrder.OrganizationIdInternal);
            }
          }

          if (workOrder.workerProfileTypeId === PhxConstants.UserProfileType.WorkerTemp) {
            if (this.changePaymentRatesForWorkSite(workOrderVersion.PaymentInfoes, subdivisionIdByWorksite)) {
              worksiteChangedMessage.push('The default setting for applying vacation pay has been updated.');
            }
          }
        }
      }

      const oldSubdivisionIdByWorksite = this.workOrderService.getSubdivisionIdByWorksiteId(oldWorksiteId);
      if (oldSubdivisionIdByWorksite !== subdivisionIdByWorksite) {
        const responseWCBList: any = await this.workOrderService.getWCBCodesBySubdivisionId(subdivisionIdByWorksite, workOrder.OrganizationIdInternal).toPromise();
        const wcbList = (responseWCBList ? responseWCBList.Items : null) || [];
        const checkEarningvalidate = !!wcbList.length;
        if (workOrderVersion.WorkerCompensationId || WorkorderTabEarningsAndDeductionSafetyInsuranceComponent.checkEarningvalidate !== checkEarningvalidate) {
          // notify user when (1) WCB was selected, or (2) field mandatory settings changed
          worksiteChangedMessage.push('The Workplace Safety Insurance Worker Classification list has been updated.');
        }
        WorkorderTabEarningsAndDeductionSafetyInsuranceComponent.checkEarningvalidate = checkEarningvalidate;
        workOrderVersion.WCBIsApplied = null;
        workOrderVersion.WorkerCompensationId = null;
      }

      if (worksiteChangedMessage.length > 0) {
        this.dialogService.notify('The Worksite Province has Changed', worksiteChangedMessage.join('<br>'), { backdrop: 'static', size: 'md' });
      }
    }
  }

  async onChangeSubdivisionIdSalesTax(workOrder: IWorkOrder) {
    const workOrderVersion: IWorkOrderVersion = workOrder ? workOrder.WorkOrderVersion : null;
    const billingInfo = workOrderVersion.BillingInfoes ? workOrderVersion.BillingInfoes[0] : null;
    if (billingInfo) {
      billingInfo.BillingSalesTaxes = await this.workOrderService.getBillingSalesTaxes(billingInfo, workOrder.OrganizationIdInternal);
    }
  }

  /*
    converted from AssignmentCommonFunctionalityService.js -- getPaymentSalesTaxes
   */
  async onChangePaymentSubdivisionIdSalesTax(workOrder: IWorkOrder, paymentInfo: IPaymentInfo): Promise<void> {
    if (workOrder && paymentInfo) {
      paymentInfo.PaymentSalesTaxes = await this.workOrderService.getPaymentSalesTaxes(paymentInfo, workOrder.UserProfileIdWorker, workOrder.workerProfileTypeId);
    }
  }

  changePaymentRatesForWorkSite(paymentInfos: Array<IPaymentInfo>, subdivisionIdByWorksite: number): boolean {
    let isChanged: boolean = false;

    if (paymentInfos && subdivisionIdByWorksite) {
      paymentInfos.forEach(paymentInfo => {
        if (paymentInfo && paymentInfo.PaymentRates) {
          paymentInfo.PaymentRates.forEach(paymentRate => {
            const defaultDeductionConfig = PhxConstants.DefaultPaymentRateDeductions.find(r => r.RateTypeId === paymentRate.RateTypeId);
            const defaultConfig = defaultDeductionConfig ? defaultDeductionConfig.defaults.find(config => config.SubdivisionId === subdivisionIdByWorksite) : null;
            if (defaultConfig) {
              if (paymentRate.IsApplyVacation !== defaultConfig.IsApplyVacation || paymentRate.IsApplyDeductions !== defaultConfig.IsApplyDeductions) {
                isChanged = true;
                paymentRate.IsApplyVacation = defaultConfig.IsApplyVacation;
                paymentRate.IsApplyDeductions = defaultConfig.IsApplyDeductions;
              }
            }
          });
        }
      });
    }

    return isChanged;
  }

  async onChangeOrganizationIdClient(workOrder: IWorkOrder, billingInfo: IBillingInfo): Promise<void> {
    if (!this.listOrganizationClient) {
      const response: any = await this.workOrderService.getListOrganizationClient().toPromise();
      this.listOrganizationClient = response ? response.Items : null;
    }
    const workOrderVersion = workOrder ? workOrder.WorkOrderVersion : null;
    const organizationIdClient = billingInfo ? billingInfo.OrganizationIdClient : null;
    const organizationClient = this.listOrganizationClient ? this.listOrganizationClient.find(o => o.Id === organizationIdClient) : null;

    if (workOrderVersion && organizationClient) {
      billingInfo.OrganizationClientDisplayName = organizationClient.DisplayName;

      //  http://tfs:8080/tfs/DefaultCollection/Development/_workitems#_a=edit&id=15523
      if (!organizationClient.OrganizationClientRoles || organizationClient.OrganizationClientRoles.length !== 1) {
        return Promise.reject('Client Organization MUST have ONE OrganizationClientRole');
      }

      if (organizationClient.OrganizationClientRoles[0].IsChargeSalesTax === true) {
        if (organizationClient.OrganizationClientRoles[0].ClientSalesTaxDefaultId === PhxConstants.ClientSalesTaxDefault.HeadOffice) {
          const organizationAddressPrimary = organizationClient.OrganizationAddresses.find(address => address.IsPrimary);
          if (organizationAddressPrimary) {
            billingInfo.SubdivisionIdSalesTax = organizationAddressPrimary.SubdivisionId;
          } else {
            this.commonService.logError('Client Organization MUST have Primary Address');
            billingInfo.SubdivisionIdSalesTax = 0;
          }
        } else if (organizationClient.OrganizationClientRoles[0].ClientSalesTaxDefaultId === PhxConstants.ClientSalesTaxDefault.WorkOrderWorksite) {
          billingInfo.SubdivisionIdSalesTax = this.workOrderService.getSubdivisionIdByWorksiteId(workOrderVersion.WorksiteId);
        } else {
          this.commonService.logError('Client Organization ClientSalesTaxDefaultId "' + organizationClient.OrganizationClientRoles[0].ClientSalesTaxDefaultId + '" does NOT supported');
        }
      } else {
        billingInfo.SubdivisionIdSalesTax = this.workOrderService.getSubdivisionIdByWorksiteId(workOrderVersion.WorksiteId);
      }

      if (organizationClient.OrganizationClientRoles[0].UsesThirdPartyImport) {
        workOrderVersion.TimeSheetMethodologyId = PhxConstants.ExpenseMethodology.ThirdPartyImport;
        if (billingInfo.BillingInvoices && billingInfo.BillingInvoices.length) {
          billingInfo.BillingInvoices.forEach(billingInvoice => {
            if (billingInvoice.InvoiceTypeId === PhxConstants.InvoiceType.Expense) {
              billingInvoice.IsSalesTaxAppliedOnVmsImport = organizationClient.OrganizationClientRoles[0].IsBillSalesTaxAppliedOnExpenseImport;
            }
          });
        }
        if (workOrderVersion.PaymentInfoes && workOrderVersion.PaymentInfoes.length) {
          workOrderVersion.PaymentInfoes.forEach(paymentInfo => {
            if (paymentInfo && paymentInfo.PaymentInvoices && paymentInfo.PaymentInvoices.length) {
              paymentInfo.PaymentInvoices.forEach(paymentInvoice => {
                if (paymentInvoice.InvoiceTypeId === PhxConstants.InvoiceType.Expense) {
                  paymentInvoice.IsSalesTaxAppliedOnVmsImport = organizationClient.OrganizationClientRoles[0].IsPaySalesTaxAppliedOnExpenseImport;
                }
              });
            }
          });
        }
      }

      billingInfo.BillingSalesTaxes = await this.workOrderService.getBillingSalesTaxes(billingInfo, workOrder.OrganizationIdInternal);
    }
  }
}
