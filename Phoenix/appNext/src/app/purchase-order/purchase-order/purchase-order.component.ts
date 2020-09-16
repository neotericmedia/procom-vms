// angular
import { Component, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { PurchaseOrderService } from './../purchase-order.service';
// common
import { FormGroup, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { NavigationService } from './../../common/services/navigation.service';
import { CustomFieldService, PhxConstants, CommonService } from '../../common';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { getRouterState, IRouterState } from '../../common/state/router/reducer';
import { NavigationBarItem } from '../../common/model';
// purchase order
import { IPurchaseOrder, IVersion, PurchaseOrderAction } from '../state/index';
import { PurchaseOrderObservableService } from '../state/purchase-order.observable.service';
import { IReadOnlyStorage, IPurchaseOrderRouterState, IRoot, IFormGroupSetup, IWorkflowButton } from './../state/purchase-order.interface';
// import { PurchaseOrderDetailsComponent } from '../purchase-order-details/purchase-order-details.component';
import { PurchaseOrderTabDetailsComponent } from '../purchase-order-tab-details/purchase-order-tab-details.component';
import { PhxWorkflowButtonsComponent } from '../../common/components/phx-workflow-buttons/phx-workflow-buttons.component';
import { PhxNavigationBarComponent } from '../../common/components/phx-navigation-bar/phx-navigation-bar.component';

import { HashModel } from '../../common/utility/hash-model';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
import { each } from 'lodash';
import { PurchaseOrderDetailsComponent } from '../purchase-order-details/purchase-order-details.component';

@Component({
  selector: 'app-purchase-order',
  templateUrl: './purchase-order.component.html',
  styleUrls: ['./purchase-order.component.less']
})

export class PurchaseOrderComponent extends BaseComponentActionContainer implements OnInit {
  @ViewChild('buttonActionButtons') buttonActionButtons: PhxWorkflowButtonsComponent;
  @ViewChild('navigationBar') navigationBar: PhxNavigationBarComponent;
  @ViewChild('modal') modal: PhxModalComponent;
  @ViewChild('discardModal') discardModal: PhxModalComponent;
  purchaseOrder: IPurchaseOrder = null;
  readOnlyStorage: IReadOnlyStorage = null;
  routerState: IPurchaseOrderRouterState = null;
  public routerParams: any;
  rootFormGroup: FormGroup<IRoot>;
  isOrgDetails: boolean = true;
  activeInEditMode: boolean;
  actionButton: IWorkflowButton = {} as IWorkflowButton;
  html: {
    navigationBarContent: Array<NavigationBarItem>;
    codeValueGroups: any;
    phxConstants: typeof PhxConstants;
    validationMessages: Array<string>;
    versionsOrdered: Array<IVersion>;
    codeValueLists: {};
    commonLists: {};
    access: {};
  } = {
      navigationBarContent: null,
      codeValueGroups: null,
      phxConstants: null,
      validationMessages: [],
      versionsOrdered: null,
      codeValueLists: {},
      commonLists: {},
      access: {}
    };

  formGroupSetup: IFormGroupSetup;

  constructor(
    private navigationService: NavigationService,
    private purchaseOrderObservableService: PurchaseOrderObservableService,
    private formBuilder: FormBuilder,
    private customFieldService: CustomFieldService,
    private commonService: CommonService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private purchaseOrderService: PurchaseOrderService
  ) {
    super();
    console.log(this.constructor.name + '.constructor');
    this.html.phxConstants = PhxConstants;
    this.html.codeValueGroups = this.commonService.CodeValueGroups;
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
  }

  ngOnInit(): void {
    this.stateService
      .selectOnAction(getRouterState)
      .switchMap((routerStateResult: IRouterState) => {
        console.log(this.constructor.name + '.routerStateResult.location: ' + routerStateResult.location);
        if (routerStateResult.location.includes(PhxConstants.PurchaseOrderNavigationName.details)) {
          this.setRouterState(routerStateResult, PhxConstants.PurchaseOrderNavigationName.details);
        } else if (routerStateResult.location.includes(PhxConstants.PurchaseOrderNavigationName.documents)) {
          this.setRouterState(routerStateResult, PhxConstants.PurchaseOrderNavigationName.documents);
        } else if (routerStateResult.location.includes(PhxConstants.PurchaseOrderNavigationName.workOrders)) {
          this.setRouterState(routerStateResult, PhxConstants.PurchaseOrderNavigationName.workOrders);
        } else if (routerStateResult.location.includes(PhxConstants.PurchaseOrderNavigationName.changeHistory)) {
          this.setRouterState(routerStateResult, PhxConstants.PurchaseOrderNavigationName.changeHistory);
        }

        return this.routerState.purchaseOrderId ? this.purchaseOrderObservableService.purchaseOrder$(this, this.routerState.purchaseOrderId) : Observable.of(null);
      })
      .takeUntil(this.isDestroyed$)
      .subscribe((purchaseOrder: IPurchaseOrder) => {
        if (purchaseOrder) {
          this.navigationService.setTitle('purchaseorder-viewedit', [purchaseOrder.PurchaseOrderNumber]);
          this.purchaseOrder = purchaseOrder;
          this.setActionButton(this.activeInEditMode);
          this.onInitPurchaseOrder(purchaseOrder);
        }
      });
  }

  setRouterState(routerStateResult: IRouterState, PurchaseOrderNavigationName: string) {
    this.routerState = {
      purchaseOrderId: routerStateResult.params.purchaseOrderId,
      routerPath: PurchaseOrderNavigationName,
      url: routerStateResult.location
    };
  }

  onInitPurchaseOrder(purchaseOrder: any) {
    setTimeout(() => (this.html.navigationBarContent = this.navigationBarContentSetup()));
    this.readOnlyStorage = purchaseOrder.ReadOnlyStorage;
    this.calculateFunds(purchaseOrder);
    this.formBuilderGroupSetup(this.formGroupSetup, purchaseOrder, this.purchaseOrderObservableService);
    console.log(this.constructor.name + '.onInitWorkorder()');
  }

  navigationBarContentSetup(): Array<NavigationBarItem> {
    const path = `/next/purchase-order/${this.routerState.purchaseOrderId}/`;
    return [
      {
        Id: 1,
        IsDefault: true,
        IsHidden: false,
        Name: PhxConstants.PurchaseOrderNavigationName.details,
        Path: path + PhxConstants.PurchaseOrderNavigationName.details,
        DisplayText: 'Details'
      },
      {
        Id: 2,
        IsDefault: false,
        IsHidden: false,
        Name: PhxConstants.PurchaseOrderNavigationName.workOrders,
        Path: path + PhxConstants.PurchaseOrderNavigationName.workOrders,
        DisplayText: 'Work Orders'
      },
      {
        Id: 3,
        IsDefault: false,
        IsHidden: false,
        Valid: true,
        Name: PhxConstants.PurchaseOrderNavigationName.changeHistory,
        Path: path + PhxConstants.PurchaseOrderNavigationName.changeHistory,
        DisplayText: 'Change History'
      },
      {
        Id: 7,
        IsDefault: false,
        IsHidden: false,
        Name: PhxConstants.PurchaseOrderNavigationName.documents,
        Path: path + PhxConstants.PurchaseOrderNavigationName.documents,
        DisplayText: 'Documents'
      }
    ];
  }

  formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, purchaseOrder: IPurchaseOrder, purchaseOrderObservableService: PurchaseOrderObservableService) {
    this.rootFormGroup = formGroupSetup.formBuilder.group<IRoot>({
      PurchaseOrderId: [purchaseOrder.Id],
      TabDetails: PurchaseOrderTabDetailsComponent.formBuilderGroupSetup(formGroupSetup, purchaseOrder, purchaseOrderObservableService)
    });
  }

  calculateFunds(purchaseOrder: any) {
    return PurchaseOrderDetailsComponent.calculateFunds(purchaseOrder);
  }

  onOutputEvent() {
    this.purchaseOrder = {
      ...this.purchaseOrder,
      ...PurchaseOrderTabDetailsComponent.formGroupToPartial(this.purchaseOrder, this.rootFormGroup),
    };
    this.stateService.dispatchOnAction(
      new PurchaseOrderAction.PurchaseOrderUpdate({
        ...this.purchaseOrder,
        ...PurchaseOrderTabDetailsComponent.formGroupToPartial(this.purchaseOrder, this.rootFormGroup),
      })
    );
  }

  setActionButton(activeInEditMode = false) {
    this.actionButton.save = this.purchaseOrder.StatusId === PhxConstants.PurchaseOrderStatus.Draft || this.purchaseOrder.StatusId === PhxConstants.PurchaseOrderStatus.New;
    this.actionButton.submit = this.purchaseOrder.StatusId === PhxConstants.PurchaseOrderStatus.Draft || this.purchaseOrder.StatusId === PhxConstants.PurchaseOrderStatus.New || activeInEditMode;
    this.actionButton.edit = this.purchaseOrder.StatusId === PhxConstants.PurchaseOrderStatus.Active && !activeInEditMode;
    this.actionButton.discard = this.purchaseOrder.StatusId === PhxConstants.PurchaseOrderStatus.Draft;
    this.actionButton.cancel = activeInEditMode;
    this.actionButton.showAddLine = this.purchaseOrder.StatusId === PhxConstants.PurchaseOrderStatus.Draft || this.purchaseOrder.StatusId === PhxConstants.PurchaseOrderStatus.New || activeInEditMode;
    this.actionButton.showDeleteLine = this.purchaseOrder.StatusId === PhxConstants.PurchaseOrderStatus.Draft || this.purchaseOrder.StatusId === PhxConstants.PurchaseOrderStatus.New || activeInEditMode;
  }

  onClickEdit() {
    this.activeInEditMode = true;
    this.setActionButton(this.activeInEditMode);
  }

  onClickCancel() {
    this.modal.show();
  }

  onClickDiscard() {
    this.discardModal.show();
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

  discardPurchaseorder() {
    const commandDiscard = { 'Id': this.purchaseOrder.Id, 'LastModifiedDatetime': this.getMaxLastModified() };
    this.purchaseOrderService.purchaseOrderDiscard(commandDiscard).subscribe((result) => {
      if (result) {
        this.commonService.logSuccess('Purchase Order Discarded');
        this.router.navigate(['/next', 'purchase-order', 'search']);
      }
    }, error => {
      const validationMessages = this.commonService.parseResponseError(error);
      if (validationMessages.length > 0) {
        this.html.validationMessages = [];
        validationMessages.forEach(element => {
          this.html.validationMessages.push(element.Message);
        });
      }
    });
  }

  save() {
    this.savePo(this.purchaseOrder).subscribe(response => {
      if (response.IsValid) {
        this.stateService.dispatchOnAction(new PurchaseOrderAction.PurchaseOrderDelete(this.purchaseOrder.Id));
        this.commonService.logSuccess('Purchase Order Saved');
        const navigatePath = `/next/purchase-order/${this.purchaseOrder.Id}/details`;

        this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
          console.error(`app-purchaseorder: error navigating to ${this.purchaseOrder.Id} , details`, err);
        });
      }
    }, error => {
      const validationMessages = this.commonService.parseResponseError(error);
      if (validationMessages.length > 0) {
        this.html.validationMessages = [];
        validationMessages.forEach(element => {
          this.html.validationMessages.push(element.Message);
        });
      }
    });
  }

  savePo(po: any) {
    delete po.ReadOnlyStorage;
    const commandSave: IPurchaseOrder = po;
    commandSave.LastModifiedDatetime = this.getMaxLastModified();
    return this.purchaseOrderService.purchaseOrderSave(commandSave);
  }

  submit() {
    this.savePo(this.purchaseOrder).subscribe(response => {
      if (response) {
        this.purchaseOrderService.getByPurchaseOrderId(response.EntityId).subscribe(result => {
          this.purchaseOrder.LastModifiedDatetime = result.LastModifiedDatetime;
          const submitCommand = { Id: result.Id, LastModifiedDatetime: this.getMaxLastModified() };
          this.purchaseOrderService.purchaseOrderSubmit(submitCommand).subscribe(submitResult => {
            if (submitResult.IsValid) {
              this.commonService.logSuccess('Purchase Order Submitted');
              this.activeInEditMode = false;
              this.stateService.dispatchOnAction(new PurchaseOrderAction.PurchaseOrderDelete(submitResult.EntityId));
            }
          }, error => {
            const validationMessages = this.commonService.parseResponseError(error);
            if (validationMessages.length > 0) {
              this.html.validationMessages = [];
              validationMessages.forEach(element => {
                this.html.validationMessages.push(element.Message);
              });
            }
          });
        });
      }
    });
  }

  modalFabButtons = [
    {
      icon: 'done',
      tooltip: 'Yes',
      btnType: 'primary',
      action: () => {
        this.modal.hide();
        this.activeInEditMode = false;
        this.stateService.dispatchOnAction(
          new PurchaseOrderAction.PurchaseOrderDelete(this.purchaseOrder.Id)
        );
      }
    },
    {
      icon: 'library_add',
      tooltip: 'No',
      btnType: 'default',
      action: () => {
        this.modal.hide();
        console.log('Save & New');
      }
    }
  ];

  modalDiscardFabButtons = [
    {
      icon: 'done',
      tooltip: 'Yes',
      btnType: 'primary',
      action: () => {
        this.discardModal.hide();
        this.discardPurchaseorder();
      }
    },
    {
      icon: 'library_add',
      tooltip: 'No',
      btnType: 'default',
      action: () => {
        this.discardModal.hide();
        console.log('Save & New');
      }
    }
  ];
}
