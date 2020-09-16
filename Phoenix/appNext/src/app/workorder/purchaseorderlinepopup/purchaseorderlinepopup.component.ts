import { Component, OnInit, OnChanges, Input, EventEmitter, Output, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
import { PhxConstants, CustomFieldService, CodeValueService, CommonService, ValidationExtensions } from '../../common';
import { IFormGroupSetup, POLineNew, WOPOLines } from '../state/workorder.interface';
import { FormBuilder, FormGroup, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { BsModalService } from '../../../../node_modules/ngx-bootstrap';
import { WorkorderService } from '../workorder.service';
import { HashModel } from '../../common/utility/hash-model';
import { moment } from '../../../../node_modules/ngx-bootstrap/chronos/test/chain';
import { CustomFieldErrorType } from '../../common/model';
import { each } from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-purchaseorderlinepopup',
  templateUrl: './purchaseorderlinepopup.component.html',
  styleUrls: ['./purchaseorderlinepopup.component.less']
})
export class PurchaseorderlinepopupComponent extends BaseComponentActionContainer implements OnInit, OnChanges {
  @Input() POmodal: PhxModalComponent;
  @Input() LineId: number = 0;
  @Input() poLineNum: number;
  @Input() poNumber: string;
  @Input() workOderPurchaseOrderLineId: string;
  @Input() AssignmentId: number;
  @Input() workorderId: number;
  @Input() workorderNumber: number;
  @Input() workorderVersion: number;
  @Output() outputEvent = new EventEmitter();
  @Output() cancelEvent = new EventEmitter();
  purchaseorderForm: FormGroup<POLineNew>;
  lineNew: POLineNew;
  newLine = {} as POLineNew;
  listDepletionOption: Array<any>;
  listCurrency: Array<any>;
  listDepletionGroup: Array<any>;
  purchaseOrderStatuses: Array<any>;
  phxConstants = PhxConstants;
  validationMessages: Array<string> = [];
  isLineId: boolean = false;
  formGroupSetup: IFormGroupSetup;
  codeValueGroups: any;
  totalamountCommited: number = 0;
  totalamountSpent: number = 0;
  totalamountReserved: number = 0;
  totalamountAvailable: number = 0;
  totalamountAllowed: number = 0;
  WOLArray: Array<any>;
  WoArrayExists = false;
  rate: number = 0;
  workunit: string;
  emptyLine: WOPOLines;
  hasPendingRequests: boolean;
  PurchaseOrderLines: Array<any> = [];

  constructor(
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private workorderService: WorkorderService,
    private customFieldService: CustomFieldService,
    private codevalueservice: CodeValueService,
    private commonservice: CommonService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private changeRef: ChangeDetectorRef
  ) {
    super();
    this.codeValueGroups = this.commonservice.CodeValueGroups;
    this.getdepletionOption();
    this.getcurrencyList();
    this.getdepletionGroup();
    this.getstatuslist();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.LineId && changes.LineId.currentValue) {
      this.isLineId = true;
      this.LineId = changes.LineId.currentValue;
    }
    if (changes.poLineNum && changes.poLineNum.currentValue) {
      this.poLineNum = changes.poLineNum.currentValue;
    }
    if (changes.poNumber && changes.poNumber.currentValue) {
      this.poNumber = changes.poNumber.currentValue;
    }
    if (changes.AssignmentId && changes.AssignmentId.currentValue) {
      this.AssignmentId = changes.AssignmentId.currentValue;
    }
    if (changes.workorderId && changes.workorderId.currentValue) {
      this.workorderId = changes.workorderId.currentValue;
    }
    if (changes.workorderNumber && changes.workorderNumber.currentValue) {
      this.workorderNumber = changes.workorderNumber.currentValue;
    }
    if (changes.workorderVersion && changes.workorderVersion.currentValue) {
      this.workorderVersion = changes.workorderVersion.currentValue;
    }
    if (this.isLineId) {
      this.workorderService.getByPurchaseOrderLineId(this.LineId,
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
              PurchaseOrderNumber: result.Items[0].PurchaseOrderNumber,
              PurchaseOrderLineReference: result.Items[0].PurchaseOrderLineReference,
              PurchaseOrderTransactions: result.Items[0].PurchaseOrderTransactions,
              StartDate: result.Items[0].StartDate,
              StatusId: result.Items[0].StatusId,
              WorkOrderPurchaseOrderLines: result.Items[0].WorkOrderPurchaseOrderLines,
              CreatedDatetime: null,
              LastModifiedDatetime: result.Items[0].LastModifiedDatetime,
              PurchaseOrderDepletionGroupId: result.Items[0].DepletionGroupId,
              PurchaseOrderLineNumber: result.Items[0].PurchaseOrderLineNumber
            };
            if (this.workOderPurchaseOrderLineId === '-1') {
              this.addEmptyPurchaseOrderLine();
            }

            if (this.lineNew.Amount != null) {
              this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
              this.purchaseorderForm = this.formBuilderGroupSetup(this.formGroupSetup, this.lineNew);
              this.amountCalc();
              this.changeRef.detectChanges();
            }
          });
    }
  }

  addEmptyPurchaseOrderLine() {
    this.emptyLine = {
      Id: 0,
      AssignmentId: this.AssignmentId,
      WorkOrderId: this.workorderId,
      WorkOrderNumber: this.workorderNumber,
      AmountReserved: 0,
      AmountSpent: 0,
      AmountCommited: 0
    };
    this.lineNew.WorkOrderPurchaseOrderLines.push(this.emptyLine);
  }

  ngOnInit() {
    this.POmodal.modalRef = this.modalService.onHide.subscribe(() => {
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
      Id: 0,
      IsDraft: true,
      IsTaxIncluded: true,
      PurchaseOrderId: null,
      PurchaseOrderNumber: this.poLineNum,
      PurchaseOrderLineReference: null,
      PurchaseOrderTransactions: null,
      StartDate: null,
      StatusId: 1,
      WorkOrderPurchaseOrderLines: null,
      CreatedDatetime: null,
      LastModifiedDatetime: moment(Date.now()).format('YYYY-MM-DD'),
      PurchaseOrderDepletionGroupId: null,
      PurchaseOrderLineNumber: null,
    };
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    this.purchaseorderForm = this.formBuilderGroupSetup(this.formGroupSetup, this.lineNew);
  }

  formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, poform: POLineNew): FormGroup<POLineNew> {
    const formGroup = formGroupSetup.hashModel.getFormGroup<POLineNew>(formGroupSetup.toUseHashCode, 'POLineNew', poform, 0, () =>
      formGroupSetup.formBuilder.group<POLineNew>({
        Amount: [
          poform.Amount,
          [
            ValidationExtensions.minLength(0),
            ValidationExtensions.maxLength(9),
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
        WorkOrderPurchaseOrderLines: this.WorkorderAddNew(this.formGroupSetup, poform.WorkOrderPurchaseOrderLines)
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
      })
    );
    return formGroup;
  }
  updateModelFromFormGroup(formGroup: FormGroup<POLineNew>) {
    Object.assign(this.newLine, {
      ...formGroup.value
    });
  }

  onClickCancel() {
    this.POmodal.hide();
    this.WoArrayExists = false;
    this.purchaseorderForm.markAsPristine();
    this.validationMessages = [];
    this.cancelEvent.emit(this.lineNew.Id);
  }

  onClickSubmit() {
    this.updateModelFromFormGroup(this.purchaseorderForm);
    this.PurchaseOrderLines.push(this.lineNew);
    this.saveWorkOrderAssoications();
  }

  saveWorkOrderAssoications() {
    this.hasPendingRequests = true;
    const updateCommand = {
      PurchaseOrderId: this.lineNew.PurchaseOrderId,
      Id: (this.newLine.Id < 0) ? 0 : this.newLine.Id,
      StartDate: null,
      EndDate: null,
      IsTaxIncluded: this.newLine.IsTaxIncluded,
      Amount: this.newLine.Amount,
      CurrencyId: this.newLine.CurrencyId,
      PurchaseOrderLineNumber: this.newLine.PurchaseOrderLineNumber,
      Description: this.newLine.Description,
      PurchaseOrderLineReference: this.newLine.PurchaseOrderLineReference,
      DepletionOptionId: this.newLine.DepletionOptionId,
      DepletionGroupId: this.newLine.DepletionGroupId,
      WorkOrderPurchaseOrderLines: this.getUpdatedWorkOrderAssociations(this.newLine.WorkOrderPurchaseOrderLines, this.newLine.PurchaseOrderId),
      LastModifiedDatetime: this.getMaxLastModified(),
    };

    this.workorderService.PONewlineSave(updateCommand).subscribe((response: any) => {
      if (response) {
        this.hasPendingRequests = false;
        this.POmodal.hide();
        this.commonservice.logSuccess('Purchase Order Work Order Association Updated');
        const navigatePath = `/next/workorder/${this.AssignmentId}/${this.workorderId}/${this.workorderVersion}/purchaseorder`;
        this.outputEvent.emit();
        this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
          console.error(`app-workorder-purchaseorder: error navigating to ${this.workorderId} , purchaseorder`, err);
        });

      }
    }, error => {
      const validationMessages = this.commonservice.parseResponseError(error);
      if (validationMessages.length > 0) {
        validationMessages.forEach(element => {
          this.validationMessages.push(element.Message);
        });
      }
    });
  }

  getMaxLastModified() {
    if (!this.newLine.LastModifiedDatetime) {
      return new Date(Date.now());
    }
    const dates = [this.newLine.LastModifiedDatetime];
    each(this.PurchaseOrderLines, (pol: any) => {
      if (!pol.LastModifiedDatetime || typeof pol.LastModifiedDatetime === 'string') { return; }
      dates.push(pol.LastModifiedDatetime);
      each(pol.WorkOrderPurchaseOrderLines, (wopol: any) => {
        if (!wopol.LastModifiedDatetime || typeof wopol.LastModifiedDatetime === 'string') { return; }
        dates.push(wopol.LastModifiedDatetime);
      });
    });
    return new Date(Math.max.apply(Math, dates));
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
                ValidationExtensions.maxLength(9),
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
              AmountRemaining: [woNew.AmountRemaining]
            })
          )
        )
      );
      if (purschaseOrderNew.length > 0) {
        this.WoArrayExists = true;
      }
      purschaseOrderNew.forEach(obj => {
        this.workorderService.getByWorkOrderId(obj.WorkOrderId,
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
    return this.WOLArray;
  }

}
