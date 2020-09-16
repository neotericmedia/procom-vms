import { StateAction, StateActionButtonStyle, OnClickStateActionOption } from './../../common/model/state-action';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { PhxConstants, CommonService, DialogService, LoadingSpinnerService } from '../../common';
import { DialogResultType } from '../../common/model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentService } from '../../common/services/document.service';
import { DxTreeViewComponent } from 'devextreme-angular';
import { ComplianceDocumentService } from '../shared/compliance-document.service';
import { IComplianceDocumentLiteDto, NavDoc, DocHeaderWorkOrderInfo, DocHeaderOrgInfo, DocHeaderUserProfileInfo } from '../shared/compliance-document.model';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../../common/services/auth.service';
import { ApiService } from '../../common/services/api.service';
import { ConstStateActionSuccessMessages } from '../compliance-module-resource-keys';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-compliance-document-view',
  templateUrl: './compliance-document-view.component.html',
  styleUrls: ['./compliance-document-view.component.less']
})
export class ComplianceDocumentViewComponent implements OnInit, OnDestroy {
  profileId$: Observable<number>;
  isAlive: boolean = true;
  complianceDocumentId: number;
  complianceDocument: IComplianceDocumentLiteDto;
  showStateActions: boolean = true;
  stateActions: StateAction[] = [
    {
      actionId: PhxConstants.StateAction.ComplianceDocumentApprove,
      style: StateActionButtonStyle.PRIMARY,
      onClick: (action) => {
        this.confirmAndApprove(action);
      }
    },
    {
      actionId: PhxConstants.StateAction.ComplianceDocumentDecline,
      showDeclinedCommentDialog: true,
      onClick: (action, componentOption, actionOption) => {
        this.decline(action, actionOption);
      }
    }
  ];
  url: SafeResourceUrl;
  documents: NavDoc[] = [];
  codeValueGroups: any;
  entityId: number;
  entityTypeId: number;
  docHeaderWorkOrderInfo: DocHeaderWorkOrderInfo;
  docHeaderOrgInfo: DocHeaderOrgInfo;
  docHeaderUserProfileInfo: DocHeaderUserProfileInfo;
  currentPublicId: string;
  hasViewed: boolean = false;

  isSignalRActivated: boolean = false;
  unregisterFuncList: any[] = [];

  ESignStatus = PhxConstants.ESignedStatus;
  DateFormat = PhxConstants.DateFormat;

  @ViewChild('treeview') treeview: DxTreeViewComponent;

  constructor(
    private sanitizer: DomSanitizer,
    private documentService: DocumentService,
    private dialogService: DialogService,
    private complianceDocumentService: ComplianceDocumentService,
    private commonService: CommonService,
    private spinnerSvc: LoadingSpinnerService,
    private authService: AuthService,
    private apiSvc: ApiService,
    private route: ActivatedRoute
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.profileId$ = this.authService.getCurrentProfile()
      .filter(x => x != null)
      .map(x => x.Id);
    this.complianceDocumentId = parseInt(this.commonService.getUrlParams('id'), 10);
    this.entityId = parseInt(this.commonService.getUrlParams('entityId'), 10);
    this.entityTypeId = parseInt(this.commonService.getUrlParams('entityTypeId'), 10);


    this.route.params.subscribe(params => {
      if (isNaN(this.complianceDocumentId)) {
        this.complianceDocumentId = +params.id;
      }

      if (isNaN(this.entityId)) {
        this.entityId = +params.entityId;
      }

      if (isNaN(this.entityTypeId)) {
        this.entityTypeId = +params.entityTypeId;
      }

      if (!isNaN(this.complianceDocumentId) && !isNaN(this.entityId) && !isNaN(this.entityTypeId)) {
        this.loadDocHeaderInfo();
        this.loadDocuments();
        this.initSignalR();
      }
    });
  }

  ngOnDestroy() {
    this.isAlive = false;

    this.unregisterSignalR();
  }

  initSignalR() {
    if (!this.isSignalRActivated) {
      this.isSignalRActivated = true;

      this.apiSvc.onPublic('ComplianceDocumentEvent', (event, data) => {
        if (data.ComplianceDocumentId === this.complianceDocumentId) {
          switch (data.ReferenceCommandName) {
            case 'ComplianceDocumentChangeStatusFromPendingReviewToActive':
              this.showResponseMsg('Document Approved');
              break;
            case 'ComplianceDocumentChangeStatusFromPendingExemptionRequestToExemption':
              this.showResponseMsg('Exemption Approved');
              break;
            case 'ComplianceDocumentChangeStatusFromPendingReviewOrPendingExemptionRequestToDeclined':
              this.showResponseMsg('Document Declined');
              break;
            case 'ComplianceDocumentChangeStatusToDelete':
              this.showResponseMsg('Document Deleted');
              break;
            case 'ComplianceDocumentUserActionUploadDocumentMain':
              this.showResponseMsg('Document Uploaded');
              break;
            case 'ComplianceDocumentNotificationOnPendingReview':
              this.showResponseMsg('Status Updated');
              break;
          }
          this.loadDocuments();
        }
      }).then((unregister) => {
        if (unregister) {
          this.unregisterFuncList.push(unregister);
        }
      }).catch(ex => {
        console.error('ComplianceDocumentEvent exception: ' + ex);
        this.commonService.logError(ex);
      });
    }
  }

  showResponseMsg(message: string) {
    this.commonService.logSuccess(message);
    this.spinnerSvc.hide();
    this.showStateActions = false;
  }

  unregisterSignalR() {
    if (this.unregisterFuncList && this.unregisterFuncList.length) {
      for (let i = 0; i < this.unregisterFuncList.length; i++) {
        if (typeof this.unregisterFuncList[i] === 'function') {
          this.unregisterFuncList[i]();
        }
      }
    }
  }

  loadDocHeaderInfo() {
    switch (this.entityTypeId) {
      case PhxConstants.EntityType.WorkOrder:
        this.complianceDocumentService.getWorkorderInfo(this.entityId)
          .takeWhile(x => this.isAlive)
          .subscribe(res => {
            this.docHeaderWorkOrderInfo = res;
          });
        break;
      case PhxConstants.EntityType.OrganizationIndependentContractorRole:
      case PhxConstants.EntityType.OrganizationClientRole:
      case PhxConstants.EntityType.OrganizationInternalRole:
      case PhxConstants.EntityType.OrganizationSubVendorRole:
      case PhxConstants.EntityType.OrganizationLimitedLiabilityCompanyRole:
        this.complianceDocumentService.getOrgInfo(this.entityId, this.entityTypeId)
          .takeWhile(x => this.isAlive)
          .subscribe(res => {
            this.docHeaderOrgInfo = res;
          });
        break;
      case PhxConstants.EntityType.UserProfile:
        this.complianceDocumentService.getProfileInfo(this.entityId)
          .takeWhile(x => this.isAlive)
          .subscribe(res => {
            this.docHeaderUserProfileInfo = res;
          });
        break;
    }
  }

  loadTreeDocuments() {
    this.documents = [];
    this.documents.push(...this.complianceDocument.Documents.map(
      doc => {
        return <NavDoc>{
          publicId: doc.DocumentPublicId,
          text: doc.DocumentName,
          isSelected: false,
          eSignedStatusId: doc.ESignedStatusId
        };
      }
    ));
  }

  loadDocuments() {
    this.complianceDocumentService.loadComplianceDoc(this.complianceDocumentId)
      .takeWhile(() => this.isAlive).subscribe(res => {
        this.complianceDocument = res;
        this.loadTreeDocuments();
        this.showStateActions = res.AvailableStateActions.length > 0;
        if (this.documents.length > 0) {
          const index = !this.currentPublicId ? 0 : this.documents.findIndex(p => p.publicId === this.currentPublicId);
          this.documents[index].isSelected = true;
          if (!this.currentPublicId) {
            this.previewDoc(this.documents[index]);
          }
        }
      });
  }

  previewDoc(data) {
    const publicId = data.publicId;
    if (publicId !== this.currentPublicId) {
      this.currentPublicId = publicId;
      // the regex will remove the different character from
      // the file name and also removed the file extension
      const fileName = data.text.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_\s]/g, '');
      const link = this.documentService.createPdfDocumentLink(publicId, fileName);
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(link);
    }

  }

  onIframeLoad(event) {
    if (!this.hasViewed) {
      this.executeViewCommand();
    }
  }

  onItemClick(item) {
    this.treeview.instance.unselectAll();
    this.treeview.instance.selectItem(item.itemData);
    this.previewDoc(item.itemData);
  }

  executeViewCommand() {
    const commandBody = {
      ComplianceDocumentId: this.complianceDocumentId,
    };
    this.complianceDocumentService.executeStateCommand('ComplianceDocumentViewState', commandBody, false)
      .then(res => {
        this.hasViewed = true;
      });
  }

  decline(action: StateAction, actionOption: OnClickStateActionOption) {
    this.spinnerSvc.show();
    const commandBody = {
      ComplianceDocumentId: this.complianceDocumentId,
      Comments: actionOption.comment

    };
    this.complianceDocumentService.executeStateCommand(action.commandName, commandBody)
      .then(res => {
        this.commonService.logSuccess('Document Declined');
        this.spinnerSvc.hide();
      }).catch((ex) => {
        this.spinnerSvc.hideAll();
      });
  }

  confirmAndApprove(action: StateAction) {
    const message = 'All documents will be approved. Continue?';
    const title = 'Approve Documents';
    if (this.documents.length > 1) {
      this.dialogService.confirm(title, message).then((button) => {
        if (button === DialogResultType.Yes) {
          this.executeApproveCommand(action);
        } else {
          console.log('Document cancelled');
        }
      });
    } else {
      this.executeApproveCommand(action);
    }
  }

  executeApproveCommand(action: StateAction) {
    this.spinnerSvc.show();
    const commandBody = {
      ComplianceDocumentId: this.complianceDocumentId,
    };
    this.complianceDocumentService.executeStateCommand(action.commandName, commandBody)
      .then(res => {
        this.spinnerSvc.hide();

        const successMessage = ConstStateActionSuccessMessages[action.actionId];
        this.commonService.logSuccess(successMessage);

        this.loadDocuments();
      }).catch((ex) => {
        this.spinnerSvc.hideAll();
      });
  }

}

