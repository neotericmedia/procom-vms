// angular
import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef, Output, EventEmitter, ViewChild, OnChanges, SimpleChange, SimpleChanges, AfterViewInit } from '@angular/core';
// common
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
// PO
import { IPurchaseOrder, ITabDetailsDetail, IFormGroupSetup, IReadOnlyStorage, POLines } from '../state/purchase-order.interface';
import { PurchaseOrderBaseComponentPresentational } from '../purchase-order-base-component-presentational';
import { CodeValue, CustomFieldErrorType, PhxConstants } from '../../common/model';
import { PurchaseOrderService } from '../purchase-order.service';
import { ValidationExtensions } from '../../common';
import { PurchaseOrderDetailsLinesComponent } from '../purchase-order-details-lines/purchase-order-details-lines.component';

interface IHtml {
  codeValueLists: {
    purchaseOrderDepletedActionList: Array<CodeValue>;
    listCurrency: Array<CodeValue>;
    purchaseOrderInvoiceRestrictionsList: Array<CodeValue>;
  };
  commonLists: {
    listOrganizationClient: Array<any>;
  };
}
@Component({
  selector: 'app-purchase-order-details',
  templateUrl: './purchase-order-details.component.html',
  styleUrls: ['./purchase-order-details.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush

})

export class PurchaseOrderDetailsComponent extends PurchaseOrderBaseComponentPresentational<ITabDetailsDetail> implements OnInit {
  html: IHtml = {
    codeValueLists: {
      purchaseOrderDepletedActionList: [],
      listCurrency: [],
      purchaseOrderInvoiceRestrictionsList: []
    },
    commonLists: {
      listOrganizationClient: []
    }
  };
  @Input() rootModel: IPurchaseOrder;
  @Input() activeInEditMode: boolean;
  @Input() showAddLine: boolean;
  @Input() showDeleteLine: boolean;
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Output() outputEvent = new EventEmitter<any>();
  phxConstants: typeof PhxConstants;

  static totalFund = 0;
  static totalCommitted = 0;
  static amountSpentTotal = 0;
  minLineId = -1;

  constructor(private purchaseOrderService: PurchaseOrderService,
    private changeRef: ChangeDetectorRef) {
    super('PurchaseOrderDetailsComponent');
    this.phxConstants = PhxConstants;
    this.getCodeValuelistsStatic();
    this.html.codeValueLists.listCurrency = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.Currency, true);
    this.html.codeValueLists.purchaseOrderDepletedActionList = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.PurchaseOrderDepletedActions, true);
    this.html.codeValueLists.purchaseOrderInvoiceRestrictionsList = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.PurchaseOrderInvoiceRestriction, true);
    this.purchaseOrderService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole().subscribe(response => {
      if (response) {
        this.html.commonLists.listOrganizationClient = response.Items;
        this.html.commonLists.listOrganizationClient.forEach(val => {
          val.DisplayValue = val.DisplayName + ' - ' + val.Id;
        });
      }
      this.changeRef.detectChanges();
    });
  }

  ngOnInit() {
  }

  businessRules() { }

  getCodeValuelistsStatic() { }

  recalcAccessActions() { }

  recalcLocalProperties() { }

  public static calculateFunds(purchaseOrder: IPurchaseOrder) {
    this.totalFund = 0;
    this.totalCommitted = 0;
    this.amountSpentTotal = 0;
    purchaseOrder.PurchaseOrderLines.forEach(item => {
      this.totalFund += Number(item.Amount);
    });
    purchaseOrder.TotalFund = this.totalFund;
    purchaseOrder.PurchaseOrderLines.forEach((poline => {
      poline.WorkOrderPurchaseOrderLines.forEach(link => {
        this.totalCommitted += Number(link.AmountCommited);
      });
    }));
    purchaseOrder.FundCommitted = this.totalCommitted;
    purchaseOrder.PurchaseOrderLines.forEach(po => {
      po.WorkOrderPurchaseOrderLines.forEach(link => {
        this.amountSpentTotal += Number(link.AmountSpent);
      });
    });
    purchaseOrder.FundSpent = this.amountSpentTotal;
    return purchaseOrder;
  }

  public static formGroupToPartial(purchaseOrder: IPurchaseOrder, formGroupTabCoreDetail: FormGroup<ITabDetailsDetail>): IPurchaseOrder {
    const formGroupCoreDetail: FormGroup<ITabDetailsDetail> = formGroupTabCoreDetail;
    const detailsDetails: ITabDetailsDetail = formGroupCoreDetail.value;
    purchaseOrder.Id = detailsDetails.Id;
    purchaseOrder.StatusId = detailsDetails.StatusId;
    purchaseOrder.PurchaseOrderId = detailsDetails.PurchaseOrderId;
    purchaseOrder.PurchaseOrderLineNumber = detailsDetails.PurchaseOrderLineNumber;
    purchaseOrder.PurchaseOrderLineReference = detailsDetails.PurchaseOrderLineReference;
    purchaseOrder.StartDate = detailsDetails.StartDate;
    purchaseOrder.EndDate = detailsDetails.EndDate;
    purchaseOrder.Amount = detailsDetails.Amount;
    purchaseOrder.CurrencyId = detailsDetails.CurrencyId;
    purchaseOrder.IsTaxIncluded = detailsDetails.IsTaxIncluded;
    purchaseOrder.DepletionOptionId = detailsDetails.DepletionOptionId;
    purchaseOrder.DepletionGroupId = detailsDetails.DepletionGroupId;
    purchaseOrder.Description = detailsDetails.Description;
    purchaseOrder.IsDraft = detailsDetails.IsDraft;
    purchaseOrder.WorkOrderPurchaseOrderLines = detailsDetails.WorkOrderPurchaseOrderLines;
    purchaseOrder.LastModifiedDatetime = detailsDetails.LastModifiedDatetime;
    purchaseOrder.PurchaseOrderLines = detailsDetails.PurchaseOrderLines;
    purchaseOrder.PurchaseOrderNumber = detailsDetails.PurchaseOrderNumber;
    purchaseOrder.DepletedActionId = detailsDetails.DepletedActionId;
    purchaseOrder.InvoiceRestrictionId = detailsDetails.InvoiceRestrictionId;
    purchaseOrder.OrganizationId = detailsDetails.OrganizationId;
    purchaseOrder.deletedPurchaseOrderLines = detailsDetails.deletedPurchaseOrderLines;
    return purchaseOrder;
  }

  public static formBuilderGroupSetup(
    formGroupSetup: IFormGroupSetup,
    purchaseOrder: IPurchaseOrder): FormGroup<ITabDetailsDetail> {
    return formGroupSetup.hashModel.getFormGroup<ITabDetailsDetail>(formGroupSetup.toUseHashCode, 'ITabDetailsDetail', purchaseOrder, 0, () =>
      formGroupSetup.formBuilder.group<ITabDetailsDetail>({
        Id: [purchaseOrder.Id],
        OrganizationId: [
          purchaseOrder.OrganizationId,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('OrganizationId', CustomFieldErrorType.required))
          ]
        ],
        StatusId: [purchaseOrder.StatusId],
        PurchaseOrderId: [purchaseOrder.PurchaseOrderId],
        PurchaseOrderLineNumber: [purchaseOrder.PurchaseOrderLineNumber],
        PurchaseOrderLineReference: [purchaseOrder.PurchaseOrderLineReference],
        StartDate: [purchaseOrder.StartDate],
        EndDate: [purchaseOrder.EndDate],
        Amount: [purchaseOrder.Amount],
        CurrencyId: [purchaseOrder.PurchaseOrderLines.length > 0 ? purchaseOrder.PurchaseOrderLines[0].CurrencyId : null],
        IsTaxIncluded: [purchaseOrder.IsTaxIncluded],
        DepletionOptionId: [purchaseOrder.DepletionOptionId],
        DepletionGroupId: [purchaseOrder.DepletionGroupId],
        Description: [purchaseOrder.Description],
        IsDraft: [purchaseOrder.IsDraft],
        WorkOrderPurchaseOrderLines: [purchaseOrder.WorkOrderPurchaseOrderLines],
        LastModifiedDatetime: [purchaseOrder.LastModifiedDatetime],
        PurchaseOrderLines: [purchaseOrder.PurchaseOrderLines],
        PurchaseOrderNumber: [
          purchaseOrder.PurchaseOrderNumber,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PurchaseOrderNumber', CustomFieldErrorType.required))

          ]
        ],
        DepletedActionId: [
          purchaseOrder.DepletedActionId,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('DepletedActionId', CustomFieldErrorType.required))
          ]
        ],
        InvoiceRestrictionId: [
          purchaseOrder.InvoiceRestrictionId,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('InvoiceRestrictionId', CustomFieldErrorType.required))
          ]
        ],
        deletedPurchaseOrderLines: [purchaseOrder.deletedPurchaseOrderLines ? purchaseOrder.deletedPurchaseOrderLines : []],
        TotalFund: purchaseOrder.TotalFund,
        FundCommitted: purchaseOrder.FundCommitted,
        FundSpent: purchaseOrder.FundSpent
      })
    );
  }

  removeLines(index: number) {
    const purchaselines = this.inputFormGroup.controls.PurchaseOrderLines.value as Array<POLines>;
    let deletedlines = this.inputFormGroup.controls.deletedPurchaseOrderLines.value as Array<any>;
    deletedlines = deletedlines.length > 0 ? deletedlines : [];
    deletedlines.push(purchaselines[index].LastModifiedDatetime);
    purchaselines.splice(index, 1);
    this.inputFormGroup.controls.PurchaseOrderLines.patchValue(purchaselines);
    this.inputFormGroup.controls.deletedPurchaseOrderLines.patchValue(deletedlines);
    this.outputEvent.emit();
  }

  onAddLine() {
    const newLine = {
      Amount: 0,
      CreatedDatetime: null,
      CurrencyId: null,
      DepletionGroupId: null,
      DepletionOptionId: null,
      Description: null,
      EndDate: null,
      Id: this.minLineId--,
      IsDraft: true,
      IsTaxIncluded: false,
      LastModifiedDatetime: null,
      PurchaseOrderDepletionGroupId: null,
      PurchaseOrderId: null,
      PurchaseOrderLineNumber: null,
      PurchaseOrderLineReference: null,
      PurchaseOrderNumber: null,
      PurchaseOrderTransactions: null,
      StartDate: null,
      StatusId: 1,
      WorkOrderPurchaseOrderLines: [{
        Id: null,
        WorkOrderId: null,
        PurchaseOrderLineId: null,
        PurchaseOrderLineCurrencyId: null,
        PurchaseOrderLineStatusId: null,
        Amount: null,
        AmountCommited: null,
        StatusId: null,
        IsDraft: null,
        AllocationNote: null,
        LastModifiedByProfileId: null,
        LastModifiedByContactName: null,
        LastModifiedDatetime: null,
        CreatedByProfileId: null,
        CreatedByContactName: null,
        CreatedDatetime: null,
        AssignmentId: null,
        WorkOrderStartDate: null,
        WorkOrderEndDate: null,
        WorkOrderNumber: null,
        WorkOrderFullNumber: null,
        PurchaseOrderId: null,
        PurchaseOrderDepletionGroupId: null,
        PurchaseOrderDescription: null,
        PurchaseOrderLineEndDate: null,
        PurchaseOrderLineNumber: null,
        PurchaseOrderLineStartDate: null,
        PurchaseOrderNumber: null,
        OrganizationId: null,
        OrganizationLegalName: null,
        AmountAllowed: null,
        AmountReserved: null,
        AmountSpent: null,
        AmountTotal: null,
        AmountRemaining: null,
        IsWorkflowRunning: null,
      }]
    };
    const purchaselines = this.inputFormGroup.controls.PurchaseOrderLines.value as Array<POLines>;
    purchaselines.push(newLine);
    this.inputFormGroup.controls.PurchaseOrderLines.patchValue(purchaselines);
    this.outputEvent.emit();
  }
}







