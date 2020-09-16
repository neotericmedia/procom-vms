
import { Component, OnInit, Inject, Input } from '@angular/core';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
// import { FormGroup, FormBuilder, FormArray } from '..model/../common/ngx-strongly-typed-forms/model';
import { IFormGroupSetup, IFormGroupOnNew } from '../../organization/state/organization.interface';
import { BsModalService } from 'ngx-bootstrap';
import { CustomFieldService } from '../../common/services/custom-field.service';
import { CustomFieldErrorType, PhxConstants } from '../../common/model';
import { IWOSaveTemplate } from '../state/workorder.interface';
import { HashModel } from '../../common/utility/hash-model';
import { ValidationExtensions } from '../../common';
import { WorkorderService } from '../workorder.service';
import { StateService } from '../../common/state/service/state.service';

import { IWorkOrder } from '../state/workorder.interface';
import { FormBuilder, FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-workorder-save-as-template',
  templateUrl: './workorder-save-as-template.component.html',
  styleUrls: ['./workorder-save-as-template.component.less']
})
export class WorkorderSaveAsTemplateComponent implements OnInit {

  WOTemplate: IWOSaveTemplate;
  formGroupSetup: IFormGroupSetup;
  saveAsTemplateForm: FormGroup<IWOSaveTemplate>;
  TemplateData: {};
  TemplateBody: {};
  WOArray: Array<any> = [];
  assignmentCopied: {};
  WorkorderArray: Array<any> = [];
  @Input() Templatemodal: PhxModalComponent;
  @Input() workorderDetails: IWorkOrder;

  constructor(
    private formbuilder: FormBuilder,
    private customFieldService: CustomFieldService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private workOrderService: WorkorderService,
  ) {
    this.formInitialize();
  }

  ngOnInit() {
    this.formInitialize();
  }

  formInitialize() {
    this.WOTemplate = {
      templateName: null,
      templateDescription: null
    };
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formbuilder, customFieldService: this.customFieldService };
    this.saveAsTemplateForm = this.formBuilderGroupSetup(this.formGroupSetup, this.WOTemplate);
  }

  formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, saveTemplateForm: IWOSaveTemplate): FormGroup<IWOSaveTemplate> {
    const formGroup = formGroupSetup.hashModel.getFormGroup<IWOSaveTemplate>(formGroupSetup.toUseHashCode, 'Save Template', saveTemplateForm, 0, () =>
      formGroupSetup.formBuilder.group<IWOSaveTemplate>({
        templateName:
          [
            saveTemplateForm.templateName,
            [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Template Name', CustomFieldErrorType.required))
            ]
          ],
        templateDescription:
          [
            saveTemplateForm.templateDescription,
            [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Template Description', CustomFieldErrorType.required))
            ]
          ]

      })
    );
    return formGroup;
  }

  saveTemplate() {
    this.TemplateData = {
      Description: this.saveAsTemplateForm.controls.templateDescription.value,
      EntityTypeId: PhxConstants.EntityType.Assignment,
      IsPrivate: false,
      Name: this.saveAsTemplateForm.controls.templateName.value,
      // TemplateBody: this.workorderDetails.RootObject
      TemplateBody: this.getTemplateBody()
      // TemplateBody: this.assignmentToTemplate(this.workorderDetails.RootObject, 0, 0)
    };
    this.workOrderService.templateNew(this.TemplateData).subscribe((response: any) => {
      this.workOrderService.get(response.EntityId).subscribe((result: any) => {
        const navigateTo = (Id: number, tabNavigationName: PhxConstants.WorkorderNavigationName) => {
          const navigatePath = `/next/template/workorder/${Id}/${tabNavigationName}`;
          this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
            console.error(`app-organization: error navigating to ${Id} , ${tabNavigationName}`, err);
          });
        };
        // this.formInitialize();
        navigateTo(result.Id, 'core');
        this.Templatemodal.hide();
      });
    });
  }

  Cancel() {
    this.Templatemodal.hide();
  }

  getTemplateBody() {
    this.TemplateBody = {
      Id: 0,
      StatusId: PhxConstants.AssignmentStatus.Onboarding,
      OrganizationIdInternal: this.workorderDetails.RootObject.OrganizationIdInternal,    // sourceAssignment.OrganizationIdInternal,
      OrganizationCode: this.workorderDetails.RootObject.OrganizationCode,
      UserProfileIdWorker: this.workorderDetails.RootObject.UserProfileIdWorker,
      WorkOrders: this.getWorkorderArray()
    };
    return this.TemplateBody;
  }

  getWorkorderArray() {

    this.WOArray.push(
      this.workorderDetails.RootObject.WorkOrders[0]
    );
    this.WOArray[0].WorkOrderNumber = 1;
    // this.WOArray[0].WorkOrders[0].WorkOrderVersions = [];
    // this.WOArray[0].WorkOrders[0].WorkOrderVersions.push(this.workorderDetails.RootObject.WorkOrders[0].WorkOrderVersions[0]);

    this.WOArray[0].Id = 0;
    this.WOArray[0].IsDraft = true;
    this.WOArray[0].StatusId = PhxConstants.WorkOrderStatus.Processing;
    this.WOArray[0].AssignmentId = 0;
    this.WOArray[0].WorkOrderId = 0;
    this.WOArray[0].WorkOrderVersionId = 0;
    this.WOArray[0].BillingInfoId = 0;
    this.WOArray[0].PaymentInfoId = 0;
    this.WOArray[0].SourceId = 0;
    this.WOArray[0].LastModifiedByProfileId = 0;
    this.WOArray[0].CreatedByProfileId = 0;
    if (this.WOArray[0].BillingInvoices) {
      this.WOArray[0].BillingInvoices[0].Id = 0;
    }
    if (this.WOArray[0].WorkOrderVersions) {
      this.WOArray[0].WorkOrderVersions.Id = 0;
      this.WOArray[0].WorkOrderVersions.WorkOrderId = 0;
    }
    return this.WOArray;
  }


  // test functions for template api(from templateapiservice)

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  assignmentToTemplate(sourceAssignment, workOrderIndex, workOrderVersionIndex) {

    this.assignmentCopied = {
      Id: 0,
      StatusId: PhxConstants.AssignmentStatus.Onboarding,
      OrganizationIdInternal: sourceAssignment.OrganizationIdInternal,    // sourceAssignment.OrganizationIdInternal,
      OrganizationCode: sourceAssignment.OrganizationCode,
      UserProfileIdWorker: sourceAssignment.UserProfileIdWorker,
      WorkOrders: this.getArray(sourceAssignment)
    };

    const result = this.changeEntityChain(this.assignmentCopied,
      [{ key: 'Assignment', value: null },
      { key: 'WorkOrder', value: null },
      { key: 'WorkOrderVersion', value: null },
      { key: 'BillingInfo', value: null },
      { key: 'PaymentInfo', value: null },
      { key: 'Organization', value: null },
      { key: 'UserProfile', value: null },
      { key: 'PaymentContact1', value: null },
      { key: 'PaymentContact2', value: null },
      { key: 'CreatedDatetime', value: null },
      { key: 'LastModifiedDatetime', value: null },
      { key: 'WorkOrderPurchaseOrderLines', value: [] }
      ],
      [{ key: 'Id', value: 0 },
      { key: 'IsDraft', value: true },
      { key: 'StatusId', value: PhxConstants.AssignmentStatus.Onboarding },
      { key: 'AssignmentId', value: 0 },
      { key: 'WorkOrderId', value: 0 },
      { key: 'WorkOrderVersionId', value: 0 },
      { key: 'BillingInfoId', value: 0 },
      { key: 'PaymentInfoId', value: 0 },
      { key: 'SourceId', value: null },
      { key: 'LastModifiedByProfileId', value: 0 },
      { key: 'CreatedByProfileId', value: 0 }]
    );
    return result;

  }

  getArray(sourceAssignment) {
    this.WorkorderArray.push(
      sourceAssignment.WorkOrders[0]
    );
    this.WorkorderArray[0].WorkOrderNumber = 1;
    this.WorkorderArray[0].WorkOrderVersion = 1;
    // this.WorkorderArray[0].WorkOrderVersions = [];
    // this.WorkorderArray[0].WorkOrderVersions.push(sourceAssignment.WorkOrders[0].WorkOrderVersions[0]);
    return this.WorkorderArray;
  }


  changeEntityChain(obj, changeObjects: Array<any>, changeValues: Array<any>) {
    let objects = [];
    for (const i in obj) {
      if (!obj.hasOwnProperty(i)) {
        continue;
      }
      if (typeof obj[i] === 'object') {
        const objectModified = false;
        // angular.forEach(changeObjects, forEachChangeObjects.bind(null, i, objectModified));
        // if (!objectModified) {
        //     objects = objects.concat(changeEntityChain(obj[i], changeObjects, changeValues));
        // }
        changeObjects.forEach(element => {
          this.forEachChangeObjects.bind(null, i, objectModified);
        });

        if (!objectModified) {
          objects = objects.concat(this.changeEntityChain(obj[i], changeObjects, changeValues));
        }

      } else {
        // angular.forEach(changeValues, forEachChangeValues.bind(null, i));
        changeValues.forEach(element => {
          this.forEachChangeValues.bind(null, i);
        });
      }
    }
  }

  forEachChangeObjects(index, objectModified, changeObject, obj) {
    if (index === changeObject.key) {
      obj[index] = changeObject.value;
      objectModified = true;
    }
  }

  forEachChangeValues(index, changeValue, obj) {
    if (index === changeValue.key) {
      obj[index] = changeValue.value;
    }
  }
}
