import { Component, OnInit, EventEmitter, Output, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
import { FormGroup, FormBuilder, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { IPurchaseOrder, POLines, POLineNew, IFormGroupSetup, WOPOLines } from '../state/purchase-order.interface';
import { BsModalService } from 'ngx-bootstrap';
import { PhxConstants, CommonService, CodeValueService, ValidationExtensions } from '../../common';
import { HashModel } from '../../common/utility/hash-model';
import { PurchaseOrderService } from '../purchase-order.service';
import { CustomFieldService } from '../../common/services/custom-field.service';
import { CustomFieldErrorType } from '../../common/model';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { PurchaseOrderObservableService } from '../state/purchase-order.observable.service';
import { each } from 'lodash';
import { PurchaseOrderAction } from '../state';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-purchase-order-edit-modal',
  templateUrl: './purchase-order-edit-modal.component.html',
  styleUrls: ['./purchase-order-edit-modal.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PurchaseOrderEditModalComponent extends BaseComponentActionContainer implements OnInit, OnChanges {
  @Input() POmodal: PhxModalComponent;
  @Input() rootModel: IPurchaseOrder;
  @Input() LineId: number = 0;
  @Input() POModel: POLines;
  @Input() poLineNum: string;
  @Output() outputEvent = new EventEmitter();
  @Output() draftStatusEvent = new EventEmitter();
  @Output() CancelEvent = new EventEmitter();

  purchaseorderForm: FormGroup<POLineNew>;
  lineNew: POLineNew;
  newLine = {} as POLineNew;
  purchaseDetails: Array<IPurchaseOrder>;
  listDepletionOption: Array<any>;
  listCurrency: Array<any>;
  listDepletionGroup: Array<any>;
  purchaseOrderStatuses: Array<any>;
  purchaseOrder: IPurchaseOrder;
  phxConstants = PhxConstants;
  validationMessages: Array<string> = [];
  purchaseorderEditable: boolean = true;
  isNew: boolean = true;
  purchaseorderNo: number;
  statusId: number;
  polineNo: number;
  formGroupSetup: IFormGroupSetup;
  codeValueGroups: any;
  PurchaseWOLines: number = 0;
  PONumber: number = 0;
  totalamountCommited: number = 0;
  totalamountSpent: number = 0;
  totalamountReserved: number = 0;
  totalamountAvailable: number = 0;
  totalamountAllowed: number = 0;
  WOLArray: Array<any>;
  WoArrayExists = false;
  rate: number = 0;
  workunit: string;
  isCancelled: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private purchaseorderService: PurchaseOrderService,
    private customFieldService: CustomFieldService,
    private codevalueservice: CodeValueService,
    private commonservice: CommonService,
    private purchaseOrderObservableService: PurchaseOrderObservableService,
    private changeRef: ChangeDetectorRef,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    super();
    this.codeValueGroups = this.commonservice.CodeValueGroups;
    this.getdepletionOption();
    this.getcurrencyList();
    this.getdepletionGroup();
    this.getstatuslist();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getPurchaseOrderModel();
    if (changes.LineId && changes.LineId.currentValue) {
      this.LineId = changes.LineId.currentValue;
      if (this.LineId > 0) {
        this.isNew = false;
      } else {
        this.isNew = true;
        this.WoArrayExists = false;
      }
    }
    if (this.isNew) {
      this.formGroupInitialValues();
    } else {
      this.purchaseorderService.getByPurchaseOrderLineId(this.LineId,
        oreq.request()
          .withExpand(['WorkOrderPurchaseOrderLines'])
          .withSelect([
            'Id',
            'StatusId',
            'PurchaseOrderId',
            'PurchaseOrderLineNumber',
            'PurchaseOrderLineReference',
            'StartDate',
            'EndDate',
            'Amount',
            'CurrencyId',
            'IsTaxIncluded',
            'DepletionOptionId',
            'DepletionGroupId',
            'Description',
            'IsDraft',
            'WorkOrderPurchaseOrderLines',
            'LastModifiedDatetime',
          ]).url()).subscribe(result => {
            this.lineNew = {
              Amount: result.Items[0].Amount,
              CurrencyId: result.Items[0].CurrencyId,
              DepletionOptionId: result.Items[0].DepletionOptionId,
              DepletionGroupId: result.Items[0].DepletionGroupId,
              Description: result.Items[0].Description,
              EndDate: result.Items[0].EndDate,
              Id: result.Items[0].Id,
              IsDraft: result.Items[0].IsDraft,
              IsTaxIncluded: result.Items[0].IsTaxIncluded,
              PurchaseOrderId: result.Items[0].PurchaseOrderId,
              PurchaseOrderNumber: null,
              PurchaseOrderLineReference: result.Items[0].PurchaseOrderLineReference,
              PurchaseOrderTransactions: this.purchaseOrder.PurchaseOrderLines.length > 0 ? this.purchaseOrder.PurchaseOrderLines[0].PurchaseOrderTransactions : null,
              StartDate: result.Items[0].StartDate,
              StatusId: result.Items[0].StatusId,
              WorkOrderPurchaseOrderLines: result.Items[0].WorkOrderPurchaseOrderLines,
              CreatedDatetime: null,
              LastModifiedDatetime: null,
              PurchaseOrderDepletionGroupId: result.Items[0].DepletionGroupId,
              PurchaseOrderLineNumber: result.Items[0].PurchaseOrderLineNumber
            };
            if (this.lineNew.Amount != null) {
              this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
              this.purchaseorderForm = this.formBuilderGroupSetup(this.formGroupSetup, this.lineNew);
              this.amountCalc();
              this.changeRef.detectChanges();
            }
          });
    }
  }

  ngOnInit() {
    this.POmodal.modalRef = this.modalService.onHide.subscribe(() => {
    });
  }

  getPurchaseOrderModel() {
    this.purchaseOrderObservableService.purchaseOrderOnRouteChange$(this, false).subscribe((response: IPurchaseOrder) => {
      if (response) {
        this.purchaseOrder = response;
        this.PONumber = this.purchaseOrder.PurchaseOrderNumber;
        if (this.purchaseOrder.PurchaseOrderLines.length > 0) {
          if (this.purchaseOrder.PurchaseOrderLines[0].WorkOrderPurchaseOrderLines.length > 0) {
            this.PurchaseWOLines = this.purchaseOrder.PurchaseOrderLines[0].WorkOrderPurchaseOrderLines.length;
          }
        }
      }
    });
  }

  getdepletionOption() {
    this.listDepletionOption = this.codevalueservice.getCodeValues(this.codeValueGroups.PurchaseOrderDepletedOptions, true);
  }

  getcurrencyList() {
    this.listCurrency = this.codevalueservice.getCodeValues(this.codeValueGroups.Currency, true);
  }

  getdepletionGroup() {
    this.listDepletionGroup = this.codevalueservice.getCodeValues(this.codeValueGroups.PurchaseOrderDepletedGroups, true);
  }

  getstatuslist() {
    this.purchaseOrderStatuses = this.codevalueservice.getCodeValues(this.codeValueGroups.PurchaseOrderStatus, true);
  }

  formGroupInitialValues() {
    this.lineNew = {
      Amount: null,
      CurrencyId: null,
      DepletionOptionId: null,
      DepletionGroupId: null,
      Description: null,
      EndDate: null,
      Id: this.LineId,
      IsDraft: true,
      IsTaxIncluded: null,
      PurchaseOrderId: this.purchaseOrder ? this.purchaseOrder.Id : null,
      PurchaseOrderNumber: this.purchaseOrder && this.purchaseOrder.PurchaseOrderLines.length > 0 ? this.purchaseOrder.PurchaseOrderLines[0].PurchaseOrderNumber : null,
      PurchaseOrderLineReference: null,
      PurchaseOrderTransactions: null,
      StartDate: this.purchaseOrder && this.purchaseOrder.PurchaseOrderLines.length > 0 ? this.purchaseOrder.PurchaseOrderLines[0].StartDate : null,
      StatusId: 1,
      WorkOrderPurchaseOrderLines: [],
      CreatedDatetime: null,
      LastModifiedDatetime: '0001-01-01T05:00:00.000Z',
      PurchaseOrderDepletionGroupId: null,
      PurchaseOrderLineNumber: null
    };
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    this.purchaseorderForm = this.formBuilderGroupSetup(this.formGroupSetup, this.lineNew);
  }

  formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, poform: POLineNew): FormGroup<POLineNew> {
    const formGroup = formGroupSetup.formBuilder.group<POLineNew>({
      Amount: [
        poform.Amount,
        [
          ValidationExtensions.minLength(0),
          ValidationExtensions.maxLength(12),
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Amount', CustomFieldErrorType.required))
        ]
      ],
      CurrencyId: [
        poform.CurrencyId,
        [
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Currency', CustomFieldErrorType.required))
        ]
      ],
      DepletionOptionId: [
        poform.DepletionOptionId,
        [
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('DepletionOptionId', CustomFieldErrorType.required))
        ]
      ],
      DepletionGroupId: [
        poform.DepletionGroupId,
        [
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('DepletionGroupId', CustomFieldErrorType.required))
        ]
      ],
      Description: [
        poform.Description
      ],
      EndDate: [
        poform.EndDate
      ],
      Id: [
        poform.Id
      ],
      IsDraft: [
        poform.IsDraft
      ],
      IsTaxIncluded: [
        poform.IsTaxIncluded,
        [
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsTaxIncluded', CustomFieldErrorType.required))
        ]
      ],
      PurchaseOrderId: [
        poform.PurchaseOrderId
      ],
      PurchaseOrderNumber: [
        poform.PurchaseOrderNumber
      ],
      PurchaseOrderLineNumber: [
        poform.PurchaseOrderLineNumber
      ],
      PurchaseOrderLineReference: [
        poform.PurchaseOrderLineReference
      ],
      PurchaseOrderTransactions: [
        poform.PurchaseOrderTransactions
      ],
      StartDate: [
        poform.StartDate
      ],
      StatusId: [
        poform.StatusId
      ],
      WorkOrderPurchaseOrderLines:
        this.WorkorderAddNew(this.formGroupSetup, poform.WorkOrderPurchaseOrderLines)
      ,
      CreatedDatetime: [
        poform.CreatedDatetime
      ],
      LastModifiedDatetime: [
        poform.LastModifiedDatetime
      ],
      PurchaseOrderDepletionGroupId: [
        poform.PurchaseOrderDepletionGroupId
      ],
    });
    return formGroup;
  }

  updateModelFromFormGroup(formGroup: FormGroup<POLineNew>) {
    Object.assign(this.newLine, {
      ...formGroup.value
    });
  }

  onClickCancel() {
    this.isCancelled = true;
    this.WoArrayExists = false;
    this.purchaseorderForm = this.formBuilderGroupSetup(this.formGroupSetup, this.lineNew);
    this.validationMessages = [];
    this.CancelEvent.emit(true);
    this.POmodal.hide();
    // this.router.navigate(['/next', 'purchase-order', this.purchaseOrder.Id, 'details'], { relativeTo: this.activatedRoute.parent });
  }

  onClickSubmit() {
    this.isCancelled = false;
    this.savePurchaseOrderLine();
  }

  savePurchaseOrderLine() {
    if (this.purchaseOrder.StatusId !== this.phxConstants.PurchaseOrderStatus.Draft) {
      this.updateModelFromFormGroup(this.purchaseorderForm);
      if (this.isNew) {
        this.newLine.LastModifiedDatetime = this.getMaxLastModified();
        this.newLine.Id = (this.newLine.Id < 0) ? 0 : this.newLine.Id;
        this.newLine.WorkOrderPurchaseOrderLines = this.getUpdatedWorkOrderAssociations(this.newLine.WorkOrderPurchaseOrderLines, this.newLine.PurchaseOrderId);
        this.newLine.PurchaseOrderLineNumber = null;
        delete this.newLine.IsDraft;
        delete this.newLine.PurchaseOrderNumber;
        delete this.newLine.PurchaseOrderTransactions;
        delete this.newLine.StatusId;
        delete this.newLine.CreatedDatetime;
        delete this.newLine.PurchaseOrderDepletionGroupId;
        this.purchaseorderService.PONewlineSave(this.newLine).subscribe((response: any) => {
          this.purchaseorderForm.setValue(this.lineNew);
          this.commonservice.logSuccess('PO Line submitted successfully');
          this.outputEvent.emit(response.EntityId);
          this.POmodal.hide();
        }, error => {
          const validationMessages = this.commonservice.parseResponseError(error);
          if (validationMessages.length > 0) {
            validationMessages.forEach(element => {
              this.validationMessages.push(element.Message);
            });
          }
        });
      } else {
        this.newLine.LastModifiedDatetime = this.getMaxLastModified();
        this.newLine.Id = (this.newLine.Id < 0) ? 0 : this.newLine.Id;
        this.newLine.WorkOrderPurchaseOrderLines = this.getUpdatedWorkOrderAssociations(this.newLine.WorkOrderPurchaseOrderLines, this.newLine.PurchaseOrderId);
        delete this.newLine.IsDraft;
        delete this.newLine.PurchaseOrderNumber;
        delete this.newLine.PurchaseOrderTransactions;
        delete this.newLine.StatusId;
        delete this.newLine.CreatedDatetime;
        delete this.newLine.PurchaseOrderDepletionGroupId;
        this.purchaseorderService.PONewlineSave(this.newLine).subscribe((response: any) => {
          this.commonservice.logSuccess('PO Line Updated successfully');
          this.purchaseorderForm.setValue(this.lineNew);
          this.stateService.dispatchOnAction(
            new PurchaseOrderAction.PurchaseOrderDelete(this.newLine.PurchaseOrderId)
          );
          this.POmodal.hide();
        }, error => {
          const validationMessages = this.commonservice.parseResponseError(error);
          if (validationMessages.length > 0) {
            validationMessages.forEach(element => {
              this.validationMessages.push(element.Message);
            });
          }
        });
      }
    } else {
      this.updateModelFromFormGroup(this.purchaseorderForm);
      this.purchaseorderForm.setValue(this.newLine);
      this.draftStatusEvent.emit(this.newLine);
      this.POmodal.hide();
    }
  }

  amountCalc() {
    this.totalamountCommited = 0;
    this.totalamountSpent = 0;
    this.lineNew.WorkOrderPurchaseOrderLines.forEach((obj) => {
      this.totalamountCommited += isNaN(obj.AmountCommited) ? 0 : (obj.AmountCommited);
      this.totalamountSpent += isNaN(obj.AmountSpent) ? 0 : (obj.AmountSpent);
      this.totalamountAllowed += isNaN(obj.AmountAllowed) ? 0 : (obj.AmountAllowed);
      this.totalamountReserved += isNaN(obj.AmountReserved) ? 0 : (obj.AmountReserved);
    });
  }

  getMaxLastModified() {
    if (!this.purchaseOrder.LastModifiedDatetime) {
      return new Date(Date.now());
    }
    let dates = [this.purchaseOrder.LastModifiedDatetime];
    each(this.purchaseOrder.PurchaseOrderLines, (pol: any) => {
      if (!pol.LastModifiedDatetime || typeof pol.LastModifiedDatetime === 'string') { return; }
      dates.push(pol.LastModifiedDatetime);
      each(pol.WorkOrderPurchaseOrderLines, (wopol: any) => {
        if (!wopol.LastModifiedDatetime || typeof wopol.LastModifiedDatetime === 'string') { return; }
        dates.push(wopol.LastModifiedDatetime);
      });
    });
    if (this.purchaseOrder.deletedPurchaseOrderLines && this.purchaseOrder.deletedPurchaseOrderLines.length > 0) {
      dates = dates.concat(this.purchaseOrder.deletedPurchaseOrderLines);
    }
    return new Date(Math.max.apply(Math, dates));
  }

  CommitChange(CalcLine: any) {
    if (this.validationMessages.length > 0) {
      this.validationMessages.splice(1, 1);
    }
    this.validationMessages = [];
    this.totalamountCommited = 0;
    this.totalamountSpent = 0;
    this.totalamountAllowed = 0;
    this.totalamountReserved = 0;
    CalcLine.forEach(element => {
      if (this.validationMessages.length === 0) {
        if (Number(element.value.AmountCommited) - Number(element.value.AmountReserved) - Number(element.value.AmountSpent) < 0) {
          this.validationMessages.push(element.value.WorkOrderFullNumber + ' - Amount Committed: must be greater than Funds Reserved + Funds Spent');
        }
      }
      this.totalamountCommited += isNaN(Number(element.value.AmountCommited)) ? 0 : Number((element.value.AmountCommited));
      this.totalamountSpent += isNaN(Number(element.value.AmountSpent)) ? 0 : Number((element.value.AmountSpent));
      this.totalamountAllowed += isNaN(Number(element.value.AmountAllowed)) ? 0 : Number((element.value.AmountAllowed));
      this.totalamountReserved += isNaN(Number(element.value.AmountReserved)) ? 0 : Number((element.value.AmountReserved));
    });
    if (this.validationMessages.length === 0) {
      if ((Number(this.purchaseorderForm.value.Amount)) - this.totalamountCommited < 0) {
        this.validationMessages.push('The amount committed cannot be greater than the funds available');
      }
    }
  }

  WorkorderAddNew(formGroupOnNew: IFormGroupSetup, purschaseOrderNew: Array<WOPOLines>): FormArray<WOPOLines> {
    if (purschaseOrderNew != null) {
      this.rate = 0;
      const ex = formGroupOnNew.formBuilder.array<WOPOLines>(
        purschaseOrderNew.map((woNew: WOPOLines, index) =>
          formGroupOnNew.hashModel.getFormGroup<WOPOLines>(formGroupOnNew.toUseHashCode, 'WOPOLines', woNew, index, () =>
            formGroupOnNew.formBuilder.group<WOPOLines>({
              Id: [woNew.Id],
              WorkOrderId: [woNew.WorkOrderId],
              PurchaseOrderLineId: [woNew.PurchaseOrderLineId],
              PurchaseOrderLineCurrencyId: [woNew.PurchaseOrderLineCurrencyId],
              PurchaseOrderLineStatusId: [woNew.PurchaseOrderLineStatusId],
              Amount: [woNew.Amount],
              AmountCommited: [woNew.AmountCommited,
              [
                ValidationExtensions.minLength(0),
                ValidationExtensions.maxLength(12),
                ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('Amount Commited', CustomFieldErrorType.required))
              ]
              ],
              StatusId: [woNew.StatusId],
              IsDraft: [woNew.IsDraft],
              AllocationNote: [woNew.AllocationNote],
              LastModifiedByProfileId: [woNew.LastModifiedByProfileId],
              LastModifiedByContactName: [woNew.LastModifiedByContactName],
              LastModifiedDatetime: [woNew.LastModifiedDatetime],
              CreatedByProfileId: [woNew.CreatedByProfileId],
              CreatedByContactName: [woNew.CreatedByContactName],
              CreatedDatetime: [woNew.CreatedDatetime],
              AssignmentId: [woNew.AssignmentId],
              WorkOrderStartDate: [woNew.WorkOrderStartDate],
              WorkOrderEndDate: [woNew.WorkOrderEndDate],
              WorkOrderNumber: [woNew.WorkOrderNumber],
              WorkOrderFullNumber: [woNew.WorkOrderFullNumber],
              PurchaseOrderId: [woNew.PurchaseOrderId],
              PurchaseOrderDepletionGroupId: [woNew.PurchaseOrderDepletionGroupId],
              PurchaseOrderDescription: [woNew.PurchaseOrderDescription],
              PurchaseOrderLineEndDate: [woNew.PurchaseOrderLineEndDate],
              PurchaseOrderLineNumber: [woNew.PurchaseOrderLineNumber],
              PurchaseOrderLineStartDate: [woNew.PurchaseOrderLineStartDate],
              PurchaseOrderNumber: [woNew.PurchaseOrderNumber],
              OrganizationId: [woNew.OrganizationId],
              OrganizationLegalName: [woNew.OrganizationLegalName],
              AmountAllowed: [woNew.AmountAllowed],
              AmountReserved: [woNew.AmountReserved],
              AmountSpent: [woNew.AmountSpent],
              AmountTotal: [woNew.AmountTotal],
              AmountRemaining: [woNew.AmountRemaining],
              IsWorkflowRunning: [woNew.IsWorkflowRunning]
            })
          )
        )
      );
      if (purschaseOrderNew.length > 0) {
        this.WoArrayExists = true;
      }
      purschaseOrderNew.forEach(obj => {
        this.purchaseorderService.getByWorkOrderId(obj.WorkOrderId,
          oreq.request()
            .withExpand(['WorkOrders/WorkOrderVersions/BillingInfoes/BillingRates'])
            .withSelect([
              'WorkOrders/WorkOrderVersions/BillingInfoes/BillingRates/Id',
              'WorkOrders/WorkOrderVersions/BillingInfoes/BillingRates/Rate',
              'WorkOrders/WorkOrderVersions/BillingInfoes/BillingRates/RateTypeId',
              'WorkOrders/WorkOrderVersions/BillingInfoes/BillingRates/RateUnitId'
            ]).url()).subscribe(result => {
              this.rate = result.WorkOrders[0].WorkOrderVersions[0].BillingInfoes[0].BillingRates[0].Rate;
              switch (result.WorkOrders[0].WorkOrderVersions[0].BillingInfoes[0].BillingRates[0].RateUnitId) {
                case this.phxConstants.RateUnit.Hour:
                  this.workunit = 'H';
                  break;
                case this.phxConstants.RateUnit.Day:
                  this.workunit = 'D';
                  break;
                case this.phxConstants.RateUnit.Fixed:
                  this.workunit = 'F';
                  break;
                default:
                  this.workunit = '?';
              }
            });
      });
      return ex;
    } else {
      return null;
    }
  }

  getUpdatedWorkOrderAssociations(submittedPoLine: any, PurchaseorderID: number) {
    this.WOLArray = [];
    if (submittedPoLine.length > 0) {
      submittedPoLine.forEach(element => {
        const update = {
          AmountCommited: parseFloat(element.AmountCommited),
          PurchaseOrderId: PurchaseorderID,
          Id: element.Id,
          AllocationNote: element.AllocationNote,
          WorkOrderId: parseFloat(element.WorkOrderId)
        };
        this.WOLArray.push(update);
      });
    }
    return this.WOLArray;
  }

}
