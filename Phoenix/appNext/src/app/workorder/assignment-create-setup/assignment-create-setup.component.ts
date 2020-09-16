import { Component, OnInit } from '@angular/core';
import { IWorkorderSetup, IFormGroupSetup } from '../state';
import { FormBuilder, FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { CustomFieldService, CommonService, ValidationExtensions, CodeValueService, PhxConstants, NavigationService } from '../../common';
import { Router, ActivatedRoute } from '@angular/router';
import { HashModel } from '../../common/utility/hash-model';
import { CustomFieldErrorType, CodeValue } from '../../common/model';
import { filter } from 'lodash';
import { WorkorderService } from '../workorder.service';
import { Validators } from '@angular/forms';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';

@Component({
  selector: 'app-assignment-create-setup',
  templateUrl: './assignment-create-setup.component.html',
  styleUrls: ['./assignment-create-setup.component.less']
})
export class AssignmentCreateSetupComponent extends BaseComponentOnDestroy implements OnInit {
  workOrderSetup: IWorkorderSetup;
  formGroupSetup: IFormGroupSetup;
  inputFormGroup: FormGroup<IWorkorderSetup>;
  listLineOfBusiness: Array<CodeValue>;
  listAtsSource: Array<CodeValue>;
  codeValueGroups: any;
  disableATS: boolean;
  getDataInProgress: boolean = false;
  duplicateWorkOrders: Array<any> = [];
  displayWarningMessage: boolean = false;
  checkingDuplicateWorkOrders: boolean = false;

  constructor(
    private fb: FormBuilder,
    private customFieldService: CustomFieldService,
    private router: Router,
    private commonService: CommonService,
    private codeValueService: CodeValueService,
    private workorderService: WorkorderService,
    private activatedRoute: ActivatedRoute,
    private navigationService: NavigationService
  ) {
    super();
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.fb, customFieldService: this.customFieldService };
    this.getCodeValueListsStatic();
    this.getApplicationConfigurationByTypeId();
  }

  getCodeValueListsStatic() {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    const lineOfBusinesses = this.codeValueService.getCodeValues(this.codeValueGroups.LineOfBusiness, true);
    this.listLineOfBusiness = filter(lineOfBusinesses, function(o) {
      return o.id !== PhxConstants.LineOfBusiness.P;
    });
    this.listAtsSource = this.codeValueService.getCodeValues(this.codeValueGroups.AtsSource, true);
  }

  ngOnInit() {
    this.navigationService.setTitle('workorder-new');
    this.activatedRoute.params.takeUntil(this.isDestroyed$).subscribe(params => {
      const lob = +params.lineofbusinessId;
      this.workOrderSetup = {
        LineOfBusinessId: lob || null,
        AtsPlacementId: +params.atsplacementId > 0 ? Number(params.atsplacementId) : null,
        AtsSourceId: params.atssourceId > 0 ? Number(params.atssourceId) : 1
      };
    });
    this.onInitSetup(this.workOrderSetup);
  }

  onLineOfBusinessChange(event: any) {
    if (event.value === PhxConstants.LineOfBusiness.R) {
      this.inputFormGroup.controls.AtsPlacementId.setValidators(Validators.required);
    } else {
      this.inputFormGroup.controls.AtsPlacementId.clearValidators();
    }
    this.inputFormGroup.controls.AtsPlacementId.updateValueAndValidity();
    this.onChangeLineOfbusinessId();
  }

  getApplicationConfigurationByTypeId() {
    this.workorderService
      .getApplicationConfigurationByTypeId(PhxConstants.ApplicationConfigurationType.DisableATS, null)
      .takeUntil(this.isDestroyed$)
      .subscribe((response: any) => {
        this.disableATS = response.ConfigurationValue.toLowerCase() === 'true';
      });
  }

  workOrderCreate() {
    this.getDataInProgress = true;
    if ((this.duplicateWorkOrders.length > 0 && this.displayWarningMessage === true) || (this.inputFormGroup.valid && this.workOrderSetup.AtsSourceId && !this.inputFormGroup.controls.AtsPlacementId.value)) {
      this.goToNextStep();
    } else {
      this.duplicateWorkOrders = [];
      this.displayWarningMessage = false;
      if (this.inputFormGroup.valid && this.workOrderSetup.AtsSourceId && this.inputFormGroup.controls.AtsPlacementId.value) {
        this.checkingDuplicateWorkOrders = true;
        this.workorderService
          .getDuplicateAtsWorkOrder(this.workOrderSetup.AtsSourceId, this.inputFormGroup.controls.AtsPlacementId.value)
          .takeUntil(this.isDestroyed$)
          .subscribe((data: any) => {
            this.duplicateWorkOrders = data.Items && data.Items.length ? data.Items : [];
            if (data.Items.length > 0) {
              this.checkingDuplicateWorkOrders = false;
              this.displayWarningMessage = true;
              this.getDataInProgress = false;
            } else {
              this.goToNextStep();
            }
          });
      }
    }
  }

  private goToNextStep() {
    this.router.navigate([
      '/next',
      'workorder',
      'create',
      'lineofbusiness',
      this.inputFormGroup.controls.LineOfBusinessId.value,
      'atssource',
      this.inputFormGroup.controls.AtsSourceId.value,
      'atsplacement',
      this.inputFormGroup.controls.AtsPlacementId.value ? this.inputFormGroup.controls.AtsPlacementId.value : 0
    ]);
  }

  onInitSetup(workOrderSetup: IWorkorderSetup) {
    this.inputFormGroup = this.formGroupWorkorderSetup(this.formGroupSetup, workOrderSetup);
  }

  formGroupWorkorderSetup(formGroupSetup: IFormGroupSetup, workOrderSetup: IWorkorderSetup) {
    const formGroup = formGroupSetup.hashModel.getFormGroup<IWorkorderSetup>(formGroupSetup.toUseHashCode, 'IWorkorderSetup', workOrderSetup, 0, () =>
      formGroupSetup.formBuilder.group<IWorkorderSetup>({
        LineOfBusinessId: [workOrderSetup.LineOfBusinessId, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('LineOfBusinessId', CustomFieldErrorType.required))]],
        AtsPlacementId: [workOrderSetup.AtsPlacementId],
        AtsSourceId: [workOrderSetup.AtsSourceId]
      })
    );
    return formGroup;
  }

  onChangeLineOfbusinessId() {
    this.displayWarningMessage = false;
    this.duplicateWorkOrders = [];
    this.getDataInProgress = false;
  }

  onChangeAtsSourceId() {
    this.displayWarningMessage = false;
    this.duplicateWorkOrders = [];
    this.getDataInProgress = false;
  }

  onChangePlacementId() {
    this.displayWarningMessage = false;
    this.duplicateWorkOrders = [];
    this.getDataInProgress = false;
  }

  openWorkOrder(workorder) {
    const navigateTo = (assignmentId: number, workorderId: number, workorderVersionId: number, tabNavigationName: PhxConstants.WorkorderNavigationName) => {
      const navigatePath = `/next/workorder/${assignmentId}/${workorderId}/${workorderVersionId}/${tabNavigationName}`;

      this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
        console.error(`app-organization: error navigating to ${assignmentId} , ${workorderId}, ${workorderVersionId}, ${tabNavigationName}`, err);
      });
    };
    navigateTo(workorder.AssignmentId, workorder.WorkOrderId, workorder.WorkOrderVersionId, 'core');
  }
}
