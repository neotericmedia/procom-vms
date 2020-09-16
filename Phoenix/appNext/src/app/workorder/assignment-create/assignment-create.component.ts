import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { CustomFieldService, CommonService, CodeValueService, ValidationExtensions } from '../../common';
import { CodeValueGroups } from '../../common/model/phx-code-value-groups';
import { WorkorderService } from '../workorder.service';
import { HashModel } from '../../common/utility/hash-model';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { getRouterState, IRouterState } from '../../common/state/router/reducer';
import { IWorkorderNew, IFormGroupSetup, IBillingRateSetUp, IPaymentRateSetUp } from '../state';
import { CodeValue, PhxConstants, CustomFieldErrorType } from '../../common/model';
import { PhxDialogComponentConfigModel, PhxDialogComponentEventEmitterInterface } from '../../common/components/phx-dialog/phx-dialog.component.model';
import { PhxDialogComponent } from '../../common/components/phx-dialog/phx-dialog.component';

import { FormBuilder, FormGroup, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-assignment-create',
  templateUrl: './assignment-create.component.html',
  styleUrls: ['./assignment-create.component.less']
})
export class AssignmentCreateComponent extends BaseComponentActionContainer implements OnInit {
  public routerParams: any;
  public phxDialogComponentConfigModel: PhxDialogComponentConfigModel = null;
  assignment: IWorkorderNew;
  formGroupSetup: IFormGroupSetup;
  inputFormGroup: FormGroup<IWorkorderNew>;
  listProfileType: Array<CodeValue>;
  listOrganizationClient: any;
  listWorkOrderTemplates: any;
  codeValueGroups = CodeValueGroups;
  phxConstants: any;
  lineofBusinessId: number;
  sourceId: number;
  placementId: number;
  listFilteredWorkOrderTemplates: Array<any> = [];
  listUserProfileWorker: any;
  workOrderCreateInProgress: boolean = false;
  @ViewChild(PhxDialogComponent)
  phxDialogComponent: PhxDialogComponent;
  ValidationMessages: Array<string> = [];
  defaultValues: IWorkorderNew;

  constructor(private fb: FormBuilder, private customFieldService: CustomFieldService, private router: Router, private commonService: CommonService, private codeValueService: CodeValueService, private workorderService: WorkorderService) {
    super();
    this.phxConstants = PhxConstants;
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.fb, customFieldService: this.customFieldService };
  }

  ngOnInit() {
    
    this.getCodeValueListsStatic();
    this.getListOrganizationClient();
    this.getTemplatesByEntityTypeId();
    this.getListUserProfileWorker();

    this.stateService
      .selectOnAction(getRouterState)
      .switchMap((routerStateResult: IRouterState) => {
        console.log(this.constructor.name + '.routerStateResult.location: ' + routerStateResult.location);
        this.routerParams = {
          ...routerStateResult.params,
          atsSourceId: Number(routerStateResult.params.atssourceId),
          atsPlacementId: Number(routerStateResult.params.atsplacementId),
          lineofbusinessId: Number(routerStateResult.params.lineofbusinessId)
        };
        this.lineofBusinessId = Number(this.routerParams.lineofbusinessId);
        this.sourceId = Number(this.routerParams.atsSourceId);
        this.placementId = this.routerParams.atsPlacementId ? Number(this.routerParams.atsPlacementId) : 0;
        return this.routerParams.atsSourceId > 0 && this.routerParams.atsPlacementId > 0 ? this.workorderService.getAts(this.routerParams.atsSourceId, this.routerParams.atsPlacementId) : Observable.of(null);
      })
      .takeUntil(this.isDestroyed$)
      .subscribe((newWorkorder: IWorkorderNew) => {
        if (this.routerParams.atsSourceId > 0 && this.routerParams.atsPlacementId > 0 && newWorkorder && newWorkorder.AtsSourceId === 0 && newWorkorder.AtsPlacementId === 0) {
          this.commonService.logError(`ATS Placement ID ${this.routerParams.atsPlacementId} was not found.`);
          this.router.navigate(['next', 'workorder', 'createsetup', 'lineofbusiness',
          this.routerParams.lineofbusinessId,
          'atssource',
          this.routerParams.atsSourceId,
          'atsplacement',
          this.routerParams.atsPlacementId
        ]);
        } else {
          this.assignment = newWorkorder ? newWorkorder : this.setDefaultValues();
          this.onInitSetup(this.assignment);
        }
      });
  }

  setDefaultValues() {
    const newWorkorder: IWorkorderNew = {
      AtsOrganizationClientDisplayName: '',
      AtsOrganizationIdClient: null,
      AtsPlacementId: this.placementId,
      AtsSourceId: this.sourceId,
      AtsUserProfileIdWorker: null,
      AtsUserProfileWorkerName: '',
      BillingRates: [],
      PaymentRates: [],
      BillingRateUnitId: null,
      EndDate: null,
      StartDate: null,
      MappedOrganizationIdClient: null,
      MappedUserProfileIdWorker: null,
      PaymentRateUnitId: null,
      SuggestedOrganizationClientLegalName: '',
      SuggestedOrganizationIdClient: null,
      SuggestedUserProfileIdWorker: null,
      SuggestedUserProfileWorkerName: '',
      TemplateId: null
    };
    return newWorkorder;
  }

  private getCodeValueListsStatic() {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.listProfileType = this.codeValueService.getCodeValues(this.codeValueGroups.ProfileType, true);
  }

  private getListOrganizationClient() {
    this.workorderService
      .getListOrganizationClient()
      .takeUntil(this.isDestroyed$)
      .subscribe((result: any) => {
        if (result) {
          this.listOrganizationClient = result.Items;
          this.listOrganizationClient.forEach(i => {
            i.DisplayValue = i.Id + '-' + i.DisplayName;
          });
        }
      });
  }

  private getListUserProfileWorker() {
    const oDataParams = oreq
      .request()
      .withExpand(['Contact'])
      .withSelect([
        'Id',
        'ProfileTypeId',
        'OrganizationId',
         'Contact/Id',
         'Contact/FullName',

      ])
      .url();
    this.workorderService.getListUserProfileWorker(oDataParams).then((response: any) => {
      if (response && response.Items) {
        this.listUserProfileWorker = this.getFilteredListUserProfileWorker(response.Items);
        this.listUserProfileWorker.forEach((item: any) => {
          const profileName = this.listProfileType.find(i => i.id === item.ProfileTypeId);
          const displayItem = item.Id + '-' + item.Contact.FullName + '-' + profileName.description;
          item.DisplayValue = displayItem;
        });
      }
    });
  }

  private getFilteredListUserProfileWorker(items: any) {
    // 15634 - workers belonging to certain profileTypes should not appear if they are missing an org
    const workers = items.filter(function(item) {
      return item.ProfileTypeId === PhxConstants.UserProfileType.WorkerCanadianInc || item.ProfileTypeId === PhxConstants.UserProfileType.WorkerSubVendor || item.ProfileTypeId === PhxConstants.UserProfileType.WorkerUnitedStatesLLC
        ? item.OrganizationId != null
        : true;
    });
    return workers;
  }

  private getTemplatesByEntityTypeId() {
    this.workorderService
      .getTemplatesByEntityTypeId(this.phxConstants.EntityType.Assignment)
      .takeUntil(this.isDestroyed$)
      .subscribe(result => {
        this.listWorkOrderTemplates = result.Items;
        this.updateFilteredTemplates();
      });
  }

  private updateFilteredTemplates() {
    const listFilteredWorkOrderTemplates = [];
    if (this.inputFormGroup) {
      // getting the value from the control is more reliable here
      const organizationIdClient = this.inputFormGroup.controls.MappedOrganizationIdClient.value || this.inputFormGroup.controls.SuggestedOrganizationIdClient.value;

      if (this.listWorkOrderTemplates && organizationIdClient) {
        this.listWorkOrderTemplates.forEach(entity => {
          entity.Entity.WorkOrders.forEach(versions => {
            if (versions.hasOwnProperty('WorkOrderVersions')) {
              versions.WorkOrderVersions.forEach(v => {
                if (v.LineOfBusinessId === this.lineofBusinessId) {
                  v.BillingInfoes.forEach(bi => {
                    if (bi.OrganizationIdClient === this.inputFormGroup.controls.SuggestedOrganizationIdClient.value) {
                      entity.DisplayValue = entity.Name + ' (' + entity.Description + ')';
                      if(!listFilteredWorkOrderTemplates.includes(entity)){
                        listFilteredWorkOrderTemplates.push(entity);
                      }
                    
                    }
                  });
                }
              });
            }
          });
        });
      }
    }

    this.listFilteredWorkOrderTemplates = listFilteredWorkOrderTemplates;
    if (!listFilteredWorkOrderTemplates.some(x => x.Id === this.inputFormGroup.value.TemplateId)) {
      this.inputFormGroup.controls.TemplateId.setValue(null, { emitEvent: false });
    }
  }

  workOrderCreate() {
    this.workOrderCreateInProgress = true;
    this.commonService.logSuccess('Work Order Creation in Progress');

    const command = {
      UserProfileIdWorker: this.inputFormGroup.value.MappedUserProfileIdWorker || this.inputFormGroup.value.SuggestedUserProfileIdWorker,
      OrganizationIdClient: this.inputFormGroup.value.MappedOrganizationIdClient || this.inputFormGroup.value.SuggestedOrganizationIdClient,
      LineOfBusiness: this.lineofBusinessId,

      AtsSourceId: null,
      AtsPlacementId: null,

      TemplateId: null
    };

    if (this.inputFormGroup.value.AtsSourceId && this.inputFormGroup.value.AtsPlacementId) {
      command.AtsSourceId = this.inputFormGroup.value.AtsSourceId;
      command.AtsPlacementId = this.inputFormGroup.value.AtsPlacementId;
    }
    if (this.inputFormGroup.value.TemplateId) {
      command.TemplateId = this.inputFormGroup.value.TemplateId;
    }

    this.workorderService
      .workOrderNew(command)
      .takeUntil(this.isDestroyed$)
      .subscribe((workOrderNewResponseSucces: any) => {
        if (workOrderNewResponseSucces.EntityId) {
          this.workorderService
            .getByWorkOrderVersionId(workOrderNewResponseSucces.EntityId, null)
            .takeUntil(this.isDestroyed$)
            .subscribe((response: any) => {
              if (response) {
                this.router.navigate(['/next', 'workorder', response.Id, response.WorkOrders[0].Id, workOrderNewResponseSucces.EntityId, 'core']);
              }
            });
        }
      },
      (responseError) => {
        this.ValidationMessages = this.commonService.responseErrorMessages(responseError, null);
        this.commonService.logValidationMessages(this.ValidationMessages);
        this.workOrderCreateInProgress = false;
      });
  }

  showDialogNotification(headerTitle: string, bodyMessage: string) {
    this.phxDialogComponentConfigModel = {
      HeaderTitle: headerTitle,
      BodyMessage: bodyMessage,
      Buttons: [
        {
          Id: 1,
          SortOrder: 1,
          CheckValidation: true,
          Name: 'OK',
          Class: 'btn-primary',
          ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
            this.phxDialogComponent.close();
          }
        }
      ]
    };
    this.phxDialogComponent.open();
  }

  onInitSetup(workOrderSetup: IWorkorderNew) {
    this.inputFormGroup = this.formGroupWorkorderSetup(this.formGroupSetup, workOrderSetup);
    this.updateFilteredTemplates();

    this.inputFormGroup.controls.SuggestedOrganizationIdClient.valueChanges
      .distinctUntilChanged()
      .takeUntil(this.isDestroyed$)
      .subscribe(x => {
        this.updateFilteredTemplates();
      });

    this.inputFormGroup.controls.MappedOrganizationIdClient.valueChanges
      .distinctUntilChanged()
      .takeUntil(this.isDestroyed$)
      .subscribe(x => {
        this.updateFilteredTemplates();
      });
  }

  formGroupWorkorderSetup(formGroupSetup: IFormGroupSetup, workOrderSetup: IWorkorderNew) {
    const formGroup = formGroupSetup.hashModel.getFormGroup<IWorkorderNew>(formGroupSetup.toUseHashCode, 'IWorkorderNew', workOrderSetup, 0, () =>
      formGroupSetup.formBuilder.group<IWorkorderNew>({
        AtsSourceId: [this.sourceId],
        AtsPlacementId: [workOrderSetup.AtsPlacementId],
        StartDate: [moment(workOrderSetup.StartDate).format('YYYY-MM-DD')],
        EndDate: [moment(workOrderSetup.EndDate).format('YYYY-MM-DD')],
        BillingRates: AssignmentCreateComponent.formGroupWorkorderSetupForBillingRate(formGroupSetup, workOrderSetup.BillingRates),
        BillingRateUnitId: [workOrderSetup.BillingRateUnitId],
        PaymentRates: AssignmentCreateComponent.formGroupWorkorderSetupForPayementRate(formGroupSetup, workOrderSetup.PaymentRates),
        PaymentRateUnitId: [workOrderSetup.PaymentRateUnitId],
        AtsOrganizationIdClient: [workOrderSetup.AtsOrganizationIdClient],
        AtsOrganizationClientDisplayName: [workOrderSetup.AtsOrganizationClientDisplayName],
        AtsUserProfileIdWorker: [workOrderSetup.AtsUserProfileIdWorker],
        AtsUserProfileWorkerName: [workOrderSetup.AtsUserProfileWorkerName],
        MappedOrganizationIdClient: [workOrderSetup.MappedOrganizationIdClient],
        MappedUserProfileIdWorker: [workOrderSetup.MappedUserProfileIdWorker],
        SuggestedOrganizationIdClient: [workOrderSetup.SuggestedOrganizationIdClient],
        SuggestedUserProfileIdWorker: [workOrderSetup.SuggestedUserProfileIdWorker],
        TemplateId: [null]
      })
    );

    // Don't validate suggested controls if mapping exists
    if (!workOrderSetup.MappedOrganizationIdClient) {
      formGroup.controls.SuggestedOrganizationIdClient.setValidators(ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('SuggestedOrganizationIdClient', CustomFieldErrorType.required)));
    }
    if (!workOrderSetup.MappedUserProfileIdWorker) {
      formGroup.controls.SuggestedUserProfileIdWorker.setValidators(ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('SuggestedUserProfileIdWorker', CustomFieldErrorType.required)));
    }

    return formGroup;
  }

  public static formGroupWorkorderSetupForBillingRate(formGroupSetup: IFormGroupSetup, billingRates: Array<IBillingRateSetUp>): FormArray<IBillingRateSetUp> {
    const formArray = formGroupSetup.formBuilder.array<IBillingRateSetUp>(
      billingRates.map((rate: IBillingRateSetUp, index) => {
        return formGroupSetup.hashModel.getFormGroup<IBillingRateSetUp>(formGroupSetup.toUseHashCode, 'IBillingRateSetUp', rate, index, () =>
          formGroupSetup.formBuilder.group<IBillingRateSetUp>({
            RateTypeId: [rate.RateTypeId],
            Rate: [rate.Rate]
          })
        );
      })
    );
    return formArray;
  }

  public static formGroupWorkorderSetupForPayementRate(formGroupSetup: IFormGroupSetup, paymentRates: Array<IPaymentRateSetUp>): FormArray<IPaymentRateSetUp> {
    const formArray = formGroupSetup.formBuilder.array<IPaymentRateSetUp>(
      paymentRates.map((rate: IPaymentRateSetUp, index) => {
        return formGroupSetup.hashModel.getFormGroup<IPaymentRateSetUp>(formGroupSetup.toUseHashCode, 'IPaymentRateSetUp', rate, index, () =>
          formGroupSetup.formBuilder.group<IPaymentRateSetUp>({
            RateTypeId: [rate.RateTypeId],
            Rate: [rate.Rate],
            IsApplyDeductions: [rate.IsApplyDeductions],
            IsApplyVacation: [rate.IsApplyVacation],
            IsApplyStatHoliday: [rate.IsApplyStatHoliday]
          })
        );
      })
    );
    return formArray;
  }
}
