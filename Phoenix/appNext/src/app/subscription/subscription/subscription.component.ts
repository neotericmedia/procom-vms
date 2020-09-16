import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { getRouterState, IRouterState } from '../../common/state/router/reducer';
import { PhxConstants, NavigationService, CommonService, CodeValueService, CustomFieldService } from '../../common';
import { ISubscription, IReadOnlyStorage, IVersion, IFormGroupSetup, IRoot, SubscriptionAction, ITabSubscription, IWorkflowAvailableAction } from '../state/index';
import { SubscriptionObservableService } from '../state/subscription.observable.service';
import { NavigationBarItem, CodeValue, WorkflowAction } from '../../common/model';
import { Observable } from 'rxjs/Observable';
import { Router } from '../../../../node_modules/@angular/router';
import { FormGroup, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { SubscriptionTabSubscriptionComponent } from '../subscription-tab-subscription/subscription-tab-subscription.component';
import { HashModel } from '../../common/utility/hash-model';
import { SubscriptionService } from '../subscription.service';
import { PhxDialogComponentConfigModel, PhxDialogComponentEventEmitterInterface } from '../../common/components/phx-dialog/phx-dialog.component.model';
import { PhxDialogComponent } from '../../common/components/phx-dialog/phx-dialog.component';
import { SubscriptionWorkflowComponent } from '../subscription-workflow/subscription-workflow.component';
// fix me
// import { PhxWorkflowButtonsComponent, ButtonBarSortDirection } from '../../common/components/phx-workflow-buttons/phx-workflow-buttons.component';
import { PhxWorkflowButtonsComponent, ButtonBarSortDirection } from '../../common/components/phx-workflow-buttons/phx-workflow-buttons.component';
import { PhxNavigationBarComponent } from '../../common/components/phx-navigation-bar/phx-navigation-bar.component';


@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.less']
})
export class SubscriptionComponent extends BaseComponentActionContainer implements OnInit {
  public routerParams: any;
  public routerState: any;
  public subscription: ISubscription;
  public phxDialogComponentConfigModel: PhxDialogComponentConfigModel = null;
  @ViewChild(PhxDialogComponent) phxDialogComponent: PhxDialogComponent;
  @ViewChild('workFlow')
  @ViewChild('buttonActionButtons') buttonActionButtons: PhxWorkflowButtonsComponent;
  @ViewChild('navigationBar') navigationBar: PhxNavigationBarComponent;
  @ViewChild(SubscriptionWorkflowComponent) subscriptionWorkflow: SubscriptionWorkflowComponent;
  readOnlyStorage: IReadOnlyStorage;
  IsNotSubscriberPage: boolean = false;
  formGroupSetup: IFormGroupSetup;
  rootFormGroup: FormGroup<IRoot>;

  html: {
    buttonSortDirections: typeof ButtonBarSortDirection;
    navigationBarContent: Array<NavigationBarItem>;
    codeValueGroups: any;
    phxConstants: any;
    validationMessages: Array<any>;
    versionsOrdered: Array<IVersion>;
    codeValueLists: {
      subStatuses: Array<CodeValue>;
    };
    access: {};
  } = {
      buttonSortDirections: ButtonBarSortDirection,
      navigationBarContent: null,
      codeValueGroups: null,
      phxConstants: PhxConstants,
      validationMessages: [],
      versionsOrdered: null,
      codeValueLists: {
        subStatuses: []
      },
      access: {}
    };
  ValidationMessages: string[] = [];
  isSubmitted: boolean;
  constructor(private navigationService: NavigationService,
    private subscriptionObservableService: SubscriptionObservableService,
    private subscriptionService: SubscriptionService,
    private commonService: CommonService,
    private codeValueService: CodeValueService,
    private customFieldService: CustomFieldService,
    private formBuilder: FormBuilder,
    private router: Router) {
    super();
    this.html.codeValueGroups = this.commonService.CodeValueGroups;
    this.html.phxConstants = PhxConstants;
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    this.html.codeValueLists.subStatuses = this.codeValueService.getCodeValues(this.html.codeValueGroups.AccessSubscriptionStatus, true);
  }

  ngOnInit() {
    this.stateService
      .selectOnAction(getRouterState)
      .switchMap((routerStateResult: IRouterState) => {
        if (!routerStateResult.location.includes(PhxConstants.SubscriptionNavigationName.subscription)
          && !routerStateResult.location.includes(PhxConstants.SubscriptionNavigationName.history)) {
            this.setRouterState(routerStateResult, PhxConstants.SubscriptionNavigationName.subscription);
        } else if (routerStateResult.location.includes(PhxConstants.SubscriptionNavigationName.subscription)
          && !routerStateResult.location.includes(PhxConstants.SubscriptionNavigationName.history)) {
          this.setRouterState(routerStateResult, PhxConstants.SubscriptionNavigationName.subscription);
        } else if (routerStateResult.location.includes(PhxConstants.SubscriptionNavigationName.history)) {
          this.setRouterState(routerStateResult, PhxConstants.SubscriptionNavigationName.history);
        }
        this.routerParams = routerStateResult.params;
        return (routerStateResult.params.subscriptionId) ? this.subscriptionObservableService.subscription$(this, routerStateResult.params.subscriptionId) : Observable.of(null);
      })
      .takeUntil(this.isDestroyed$)
      .subscribe((subscription: ISubscription) => {
        if (subscription) {
          this.subscription = subscription;
          if (this.subscription.UserProfileSubscriber) {
            this.navigationService.setTitle('subscription-viewedit', [this.subscription.UserProfileSubscriber]);
          } else {
            this.navigationService.setTitle('subscription-new');
          }
          this.onInitSubscription(subscription);

          if (subscription.SubscriptionValidationError !== null) {
            const validationMessages = this.commonService.parseResponseError(subscription.SubscriptionValidationError);
            if (validationMessages.length > 0) {
              this.html.validationMessages = [];
              validationMessages.forEach(element => {
                this.html.validationMessages.push(element.Message);
              });
            }
          }
        }
      });
  }

  onClickWorkflowAction(action: WorkflowAction, subscription: ISubscription) {
    this.onOutputEvent();
    this.subscriptionWorkflow.onClickWorkflowAction(action, subscription);
  }

  onInitSubscription(subscription: ISubscription, repaint = true) {
    this.readOnlyStorage = subscription.ReadOnlyStorage;
    this.formBuilderGroupSetup(this.formGroupSetup, subscription, this.subscriptionObservableService);
    if (subscription.Versions) {
      this.html.versionsOrdered = subscription.Versions.sort((a, b) => {
        if (a.Id < b.Id) {
          return -1;
        }
        if (a.Id > b.Id) {
          return 1;
        }
        return 0;
      });
    }
    const that = this;
    setTimeout(
      () => {
        this.html.navigationBarContent = this.navigationBarContentSetup();

        if (that.buttonActionButtons) {
          // fix me
          //that.buttonActionButtons.repaintActionButtons();
        }

        if (that.navigationBar && repaint) {
          that.navigationBar.repaint();
        }
      });
  }

  onCommandExecutedSuccessfully() {
    // fix me
    //this.buttonActionButtons.repaintActionButtons();
    this.onInitSubscription(this.subscription);
    this.navigationBar.repaint();
  }

  setCssClassForActionButton(action: WorkflowAction) {
    return (action.CommandName === 'AccessSubscriptionApprovalApprove' || action.CommandName === 'AccessSubscriptionSubmit') ? 'primary' : 'default';
  }

  formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, subscription: ISubscription, subscriptionObservableService: SubscriptionObservableService) {
    this.rootFormGroup = formGroupSetup.formBuilder.group<IRoot>({
      SubscriptionId: subscription.Id,
      TabSubscription: SubscriptionTabSubscriptionComponent.formBuilderGroupSetup(formGroupSetup, subscription, subscriptionObservableService),
    });
  }

  onVersionClick(subscription: ISubscription, isOriginal: boolean) {
    this.routerParams.subscriptionId = subscription.Id;
    this.IsNotSubscriberPage = false;
    if (isOriginal && subscription.SourceId) {
      this.routerParams.subscriptionId = subscription.SourceId;
    }
    if (!isOriginal && subscription.ChildId) {
      this.routerParams.subscriptionId = subscription.ChildId;
    }
    this.router.navigateByUrl('/next/subscription/edit/' + this.routerParams.subscriptionId);
  }

  onOutputEvent() {
    const subscriptionFormGroup: FormGroup<ITabSubscription> = <FormGroup<ITabSubscription>>this.rootFormGroup.controls.TabSubscription;
    this.stateService.dispatchOnAction(
      new SubscriptionAction.SubscriptionUpdate({
        ...this.subscription,
        ...SubscriptionTabSubscriptionComponent.formGroupToPartial(this.subscription, subscriptionFormGroup),
      })
    );
  }

  navigationBarContentSetup(): Array<NavigationBarItem> {
    const path = `/next/subscription/edit/${this.routerParams.subscriptionId}`;
    const isHidden = this.subscription.AccessSubscriptionStatusId === PhxConstants.AccessSubscriptionStatus.Active || this.subscription.AccessSubscriptionStatusId === PhxConstants.AccessSubscriptionStatus.PendingChange;
    return [
      {
        Id: 1,
        IsDefault: true,
        IsHidden: false,
        Valid: true,
        Name: PhxConstants.SubscriptionNavigationName.subscription,
        Path: path,
        DisplayText: 'Subscription'
      },
      {
        Id: 2,
        IsDefault: false,
        IsHidden: !isHidden,
        Valid: true,
        Name: PhxConstants.SubscriptionNavigationName.history,
        Path: path + '/' + PhxConstants.SubscriptionNavigationName.history,
        DisplayText: 'History'
      }
    ];
  }

  setRouterState(routerStateResult: IRouterState, SubscriptionNavigationName: string) {
    this.routerState = {
      Id: routerStateResult.params.subscriptionId,
      routerPath: SubscriptionNavigationName,
      url: routerStateResult.location
    };
  }

}
