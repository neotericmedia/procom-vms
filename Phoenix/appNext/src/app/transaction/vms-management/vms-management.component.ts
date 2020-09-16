import { Component, OnInit, ViewChild } from '@angular/core';
import { TransactionService } from '../transaction.service';
import { AuthService } from '../../common/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { groupBy, map, filter } from 'lodash';
import { UserInfo } from '../../common/model/user';
import { CommonService, PhxConstants, CodeValueService, NavigationService } from '../../common';

import { PhxDocumentFileUploadComponent } from '../../common/components/phx-document-file-upload/phx-document-file-upload.component';
import { PhxDocumentFileUploadConfiguration, PhxDocumentFileUploaderOptions } from '../../common/model';
import { FileItem } from 'ng2-file-upload';

@Component({
  selector: 'app-vms-management',
  templateUrl: './vms-management.component.html',
  styleUrls: ['./vms-management.component.less']
})
export class VmsManagementComponent implements OnInit {

  @ViewChild('fileUpload') fileUpload: PhxDocumentFileUploadComponent;
  params; // fix me
  internalCompanies: Array<any>;
  DataParams: string = '';
  UserDetails: UserInfo;
  resultArray: Array<any>;
  vmsArrayLength: number = -1;
  hasVMSImportAccess: any;
  listOrganizationClient: Array<any>;
  showUploader: boolean = true;
  selectedOrganizationIdInternal: number = null;
  selectedOrganizationIdClient: number = null;
  documentTypeList: Array<any>;
  codeValueGroups: any;

  clientCompanyDocuments: Array<any>;

  html: {
    dataHeaderText: string,
    fileUploaderOptions_DocumentMain: PhxDocumentFileUploaderOptions,
    DocumentFileUploadConfiguration?: PhxDocumentFileUploadConfiguration
  } = {
      dataHeaderText: null,
      fileUploaderOptions_DocumentMain: {
        queueLimit: 2,
        maxFileSize: (20 * 1024 * 1024), // 20971520 == 20 MB
        allowedMimeType: [
          'image/png',
          'image/gif',
          'image/jpeg',
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.openxmlformats-officedocument.presentationml.slide',
          'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
          'application/vnd.openxmlformats-officedocument.presentationml.template',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
          'application/msword',
          'application/vnd.ms-word.document.macroenabled.12',
          'application/vnd.ms-word.template.macroenabled.12',
          'application/vnd.ms-excel',
          'application/vnd.ms-powerpoint',
          'text/plain'
        ],
        allowedFileType: [
          'image',
          'doc',
          'pdf',
          'xls',
          'ppt'
        ]
      }
    };

  constructor(
    private transactionService: TransactionService,
    private authService: AuthService,
    private router: Router,
    // private params: Params, // fix me
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private codeValueService: CodeValueService,
    private navigationService: NavigationService
  ) {
    this.checkImportAccess();
    this.getUserDetails();
    this.getOrganizationClientList();
    this.getVmItems();
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.navigationService.setTitle('thirdpartyimport-manage');

    // const self = this;
    // this.route.params.subscribe(x => {
    //   self.params = x;
    // });
  }

  checkImportAccess() {
    this.hasVMSImportAccess = this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.VMSImport);
  }

  getOrganizationClientList() {
    this.transactionService.getListOrganizationClient().subscribe((result: any) => {
      this.listOrganizationClient = result.Items;
      this.listOrganizationClient.forEach(element => {
        element.DisplayName = element.DisplayName + ' - ' + element.Id;
      });
    });
  }

  getUserDetails() {
    this.authService.getCurrentUser().subscribe((user: UserInfo) => {
      this.UserDetails = user;
    });
  }

  getVmItems() {
    this.transactionService.getVmsAllItems(this.DataParams).subscribe((result: any) => {
      const items = result.Items;
      this.internalCompanies = map(groupBy(items, 'InternalOrgDisplayName'),
        (values, key) => {
          let documentCount = 0, conflictCount = 0, preparedCount = 0;
          let discountDocumentCount = 0, discountConflictCount = 0, discountPreparedCount = 0;
          let unitedstatessourcedeductionDocumentCount = 0, unitedstatessourcedeductionConflictCount = 0, unitedstatessourcedeductionPreparedCount = 0;
          let expenseDocumentCount = 0, expenseConflictCount = 0, expensePreparedCount = 0;
          let commissionDocumentCount = 0, commissionConflictCount = 0, commissionPreparedCount = 0;
          let fixedPriceDocumentCount = 0, fixedPriceConflictCount = 0, fixedPricePreparedCount = 0;

          const internalId = values[0].OrganizationIdInternal;

          this.clientCompanyDocuments = [];

          values.forEach(item => {
            documentCount += item.DocumentCount;
            conflictCount += item.ConflictCount;
            preparedCount += item.PreparedCount;

            discountDocumentCount += item.DiscountDocumentCount;
            discountConflictCount += item.DiscountConflictCount;
            discountPreparedCount += item.DiscountPreparedCount;

            unitedstatessourcedeductionDocumentCount += item.UnitedStatesSourceDeductionDocumentCount;
            unitedstatessourcedeductionConflictCount += item.UnitedStatesSourceDeductionConflictCount;
            unitedstatessourcedeductionPreparedCount += item.UnitedStatesSourceDeductionPreparedCount;

            expenseDocumentCount += item.ExpenseDocumentCount;
            expenseConflictCount += item.ExpenseConflictCount;
            expensePreparedCount += item.ExpensePreparedCount;

            commissionDocumentCount += item.CommissionDocumentCount;
            commissionConflictCount += item.CommissionConflictCount;
            commissionPreparedCount += item.CommissionPreparedCount;

            fixedPriceDocumentCount += item.FixedPriceDocumentCount;
            fixedPriceConflictCount += item.FixedPriceConflictCount;
            fixedPricePreparedCount += item.FixedPricePreparedCount;

            this.clientCompanyDocuments.push({
              ClientOrgDisplayName: item.ClientOrgDisplayName,
              OrganizationIdClient: item.OrganizationIdClient,
              totalDocumentCount: item.DocumentCount + item.DiscountDocumentCount + item.UnitedStatesSourceDeductionDocumentCount + item.ExpenseDocumentCount + item.CommissionDocumentCount + item.FixedPriceDocumentCount,
              DisplayName: item.OrganizationIdClient + '-' + item.OrganizationIdClient
            });
          });

          this.clientCompanyDocuments = _.filter(this.clientCompanyDocuments, function (i) { return i.totalDocumentCount > 0; });

          const internalCalc = {
            InternalCompanyName: key,
            InternalCompanyId: internalId,
            DocumentCount: documentCount,
            conflictCount: conflictCount,
            PreparedCount: preparedCount,

            discountDocumentCount: discountDocumentCount,
            discountConflictCount: discountConflictCount,
            discountPreparedCount: discountPreparedCount,

            unitedstatessourcedeductionDocumentCount: unitedstatessourcedeductionDocumentCount,
            unitedstatessourcedeductionConflictCount: unitedstatessourcedeductionConflictCount,
            unitedstatessourcedeductionPreparedCount: unitedstatessourcedeductionPreparedCount,

            expenseDocumentCount: expenseDocumentCount,
            expenseConflictCount: expenseConflictCount,
            expensePreparedCount: expensePreparedCount,

            commissionDocumentCount: commissionDocumentCount,
            commissionConflictCount: commissionConflictCount,
            commissionPreparedCount: commissionPreparedCount,

            fixedPriceDocumentCount: fixedPriceDocumentCount,
            fixedPriceConflictCount: fixedPriceConflictCount,
            fixedPricePreparedCount: fixedPricePreparedCount,

            clientCompanyDocuments: this.clientCompanyDocuments,
            documentCountTotal: documentCount + discountDocumentCount + unitedstatessourcedeductionDocumentCount + expenseDocumentCount + commissionDocumentCount + fixedPriceDocumentCount,
            conflictCountTotal: conflictCount + discountConflictCount + unitedstatessourcedeductionConflictCount + expenseConflictCount + commissionConflictCount + fixedPriceConflictCount,
            preparedCountTotal: preparedCount + discountPreparedCount + unitedstatessourcedeductionPreparedCount + expensePreparedCount + commissionPreparedCount + fixedPricePreparedCount,
            isOpen: internalId === this.UserDetails.Profiles[0].OrganizationId,
            openImport: false,
            openProcessing: false,
            openConflicts: false,
            openPrepared: false,
            importOrgId: null,
            preprosOrgId: null
          };
          return internalCalc;
        });
      if (this.internalCompanies != null) {
        this.vmsArrayLength = this.internalCompanies.length;
        this.internalCompanies = this.internalCompanies.sort((a, b) => {
          if (a.InternalCompanyId === this.UserDetails.Profiles[0].OrganizationId && b.InternalCompanyId !== this.UserDetails.Profiles[0].OrganizationId) {
            return -1;
          } else if (a.InternalCompanyId !== this.UserDetails.Profiles[0].OrganizationId && b.InternalCompanyId === this.UserDetails.Profiles[0].OrganizationId) {
            return 1;
          } else {
            return a.InternalCompanyName < b.InternalCompanyName ? -1 : b.InternalCompanyName < a.InternalCompanyName ? 1 : 0;
          }
        });
      }
    });
  }

  showRecords(org) {
    const isOpen = org.isOpen;
    this.internalCompanies.forEach(eachOrg => {
      eachOrg.isOpen = false;
    });
    org.isOpen = !isOpen;
  }


  toggleProcessingOpen(company, forcedValue) {
    company.openImport = false;
    company.openPrepared = false;
    company.openConflicts = false;
    if (company.documentCountTotal) {
      company.openProcessing = typeof forcedValue === 'boolean' ? forcedValue : !company.openProcessing;
      company.importOrgId = undefined;
      company.preprosOrgId = undefined;
    }
  }

  toggleImportOpen(company, forcedValue) {
    company.openProcessing = false;
    company.openPrepared = false;
    company.openConflicts = false;
    company.openImport = typeof forcedValue === 'boolean' ? forcedValue : !company.openImport;
    company.importOrgId = undefined;
    company.preprosOrgId = undefined;
  }

  toggleOpen2(company, forcedValue) {
    company.openImport = false;
    company.openProcessing = false;
    company.openConflicts = false;
    company.openPrepared = typeof forcedValue === 'boolean' ? forcedValue : !company.openPrepared;
    company.importOrgId = undefined;
    company.preprosOrgId = undefined;
  }

  toggleOpen3(company, forcedValue) {
    company.openImport = false;
    company.openProcessing = false;
    company.openPrepared = false;
    company.openConflicts = typeof forcedValue === 'boolean' ? forcedValue : !company.openConflicts;
    company.importOrgId = undefined;
    company.preprosOrgId = undefined;
  }


  goToPreprocess(company) {
    if (company.preprosOrgId) {
      const path = 'next/transaction/vms-preprocess/' + company.InternalCompanyId + '/' + company.preprosOrgId + '/00000000-0000-0000-0000-000000000000/timesheet/00000000-0000-0000-0000-000000000000';
      // this.$state.go('ngtwo.m', { p: path });
      this.router.navigateByUrl(path);
    }
  }

  importFile(internalCompId, clientOrgId) {
    this.selectedOrganizationIdClient = internalCompId;
    this.selectedOrganizationIdInternal = clientOrgId;
    if (this.selectedOrganizationIdClient && this.selectedOrganizationIdInternal) {
      this.showUploader = true;
      const title = 'Upload a Vendor Management System document';
      this.html.DocumentFileUploadConfiguration = this.generateFileUploadConfig(title);
      this.documentTypeList = this.codeValueService.getRelatedCodeValues(this.codeValueGroups.DocumentType, PhxConstants.EntityType.VmsImportedRecord, this.codeValueGroups.EntityType);
      // this.fileUpload.showModal({
      //   maxFileSize: 20 * 1024 * 1024,
      //   queueLimit: 2,
      //   allowedFileType: ['']
      // });
      this.fileUpload.showModal(this.html.fileUploaderOptions_DocumentMain);
    }
  }


  generateFileUploadConfig(title: string):
    PhxDocumentFileUploadConfiguration {
    return new PhxDocumentFileUploadConfiguration({
      entityTypeId: PhxConstants.EntityType.VmsImportedRecord
      , entityId: 0
      , documentTypeId: PhxConstants.DocumentType.VmsRecordsFormatted
      , UploadTitle: title
      , SupportedFileExtensions: 'CSV | 20 MB file size limit',
      customComment: null
      , customUiConfig: {
        objectDate: null,
        objectComment: {
          value: null,
          isRequared: false,
          label: 'Description',
          helpBlock: null,
          minlength: 3,
          maxlength: 200,
        },
        objectDocumentType: {
          value: null,
          isRequared: true,
          label: 'Document Type',
          helpBlock: null
        }
      },
      limitMultiFileUploads: 2,
      customId1: this.selectedOrganizationIdClient,
      customId2: this.selectedOrganizationIdInternal,
    });
  }

  onCompleteUpload($event: any) {
    this.documentUploadCallbackOnDone($event.item, 'fileuploaddone', $event.response);
  }

  documentUploadCallbackOnDone(result, eventType, dataResult) {
    if (eventType === 'fileuploaddone' &&
      dataResult !== null &&
      dataResult.exceptionMessage !== null &&
      dataResult.exceptionMessage.length > 0) {
      this.commonService.logError(dataResult.exceptionMessage);
    } else if (eventType === 'fileuploaddone' &&
      dataResult !== null &&
      dataResult.notificationMessage !== null &&
      dataResult.notificationMessage.length > 0) {
      this.commonService.logError(dataResult.exceptionMessage);
      this.showUploader = false;
      this.selectedOrganizationIdInternal = null;
      this.selectedOrganizationIdClient = null;
    } else if (eventType === 'fileuploaddone' &&
      dataResult !== null &&
      dataResult.publicId !== null && dataResult.publicId !== '00000000-0000-0000-0000-000000000000' &&
      dataResult.documentTypeId !== null &&
      dataResult.documentTypeId > 0 &&
      dataResult.documentTypeId === PhxConstants.DocumentType.VmsRecordsFormatted) {

      if (this.selectedOrganizationIdInternal > 0 && this.selectedOrganizationIdClient) {
        this.showUploader = false;
        const documentPublicId = dataResult.publicId;
        // $state.go('vms.preprocessed', { organizationIdInternal: organizationIdInternal, organizationIdClient: organizationIdClient, documentPublicId: documentPublicId });
        this.router.navigate(['/next', 'transaction', 'vms-preprocess', this.selectedOrganizationIdClient, this.selectedOrganizationIdInternal, documentPublicId]);
        // const p = 'transaction/vms-preprocess/' + this.selectedOrganizationIdInternal + '/' + this.selectedOrganizationIdClient + '/' + documentPublicId;
        // this.$state.go('ngtwo.m', { p: p });
        // this.router.navigate(['/next', { p: p }]);
      }
    } else if (eventType === 'fileUploadClose') {
      this.showUploader = false;
      this.selectedOrganizationIdInternal = null;
      this.selectedOrganizationIdClient = null;
    }
  }

  documentUploadValidation(queue: Array<any>) {
    const messages = [];
    if (queue !== null && typeof queue !== 'undefined') {
      if (queue.length === 0) {
        messages.push('You need to upload at least one file');
      }
      if (queue.length === 1 || queue.length === 2) {
        let formatCount = 0, originalCount = 0;
        queue.forEach(file => {
          if (file.DocumentTypeId === PhxConstants.DocumentType.VmsRecordsFormatted) {
            formatCount++;
          } else if (file.DocumentTypeId === PhxConstants.DocumentType.VmsRecordsOriginal) {
            originalCount++;
          }
        });
        if (formatCount === 0) {
          messages.push('You must upload a formatted Document');
        }
        if (formatCount === 2) {
          messages.push('Cannot upload two formatted Documents at once');
        }
        if (originalCount === 2) {
          messages.push('Cannot upload two original Documents at once');
        }
        if (originalCount === 0 && queue.length === 2) {
          messages.push('You must upload an original Document');
        }
      }
    } else {
      messages.push('You need to upload at least one file');
    }
    return messages;
  }

  gotoProfile(id, type) {
    let navigatePath = '';
    if (['vms-timesheet', 'vms-discount', 'vms-ussourcededuction',
      'vms-expense', 'vms-commission', 'vms-fixedprice'].includes(type)) {
      navigatePath = `/next/transaction/${type}/process/${id}`;
    } else {
      navigatePath = `/next/transaction/${type}/search/${id}`;
    }
    this.router.navigateByUrl(navigatePath).catch(err => {
      console.error(`error in navigation`, err);
    });
  }

}
