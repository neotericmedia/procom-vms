import { AuthService } from './../../common/services/auth.service';
import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import * as _ from 'lodash';
import { PhxDataTableConfiguration, PhxDataTableColumn, StateAction, StateActionButtonStyle } from '../../common/model/index';
import { CommonService, DialogService } from '../../common/index';
import { NavigationService } from '../../common/services/navigation.service';
import { VmsPreprocessDetailService } from './vms-preprocess-detail.service';
import { CustomFieldService, PhxConstants } from '../../common';
import { WorkflowService } from '../../common/services/workflow.service';
import { VmsService } from '../shared/Vms.service';

declare var oreq: any;

@Component({
  templateUrl: './vms-preprocess.component.html'
})
export class VmsPreprocessComponent implements OnInit {
  emptyGuid = '00000000-0000-0000-0000-000000000000';

  organizationIdInternal: number;
  organizationIdClient: number;
  vmsDocumentId: number;
  active: any[];

  documentList: any[];
  availableActions: any;
  processing: boolean;
  totalPending: number;
  totalConflict: number;
  totalDiscarded: number;
  stateActions: StateAction[];
  availableStateActions: number[];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private authService: AuthService,
    private navigationService: NavigationService,
    private dialogService: DialogService,
    private workflowService: WorkflowService,
    private detailService: VmsPreprocessDetailService,
    private vmsService: VmsService
  ) {
    this.navigationService.setTitle('thirdpartyimport-preprocessing');
  }

  ngOnInit() {
    this.route.data.subscribe((data: any) => {
      if (data.documents && !this.organizationIdInternal) {
        this.documentList = data.documents.map(i => {
          const doc = i;
          doc.text =
            i.Document.Name +
            ' - uploaded ' +
            moment
              .utc(i.Document.UploadedDatetime)
              .toDate()
              .toLocaleString();
          doc.id = i.DocumentPublicId;
          return doc;
        });
      }
    });

    this.route.paramMap.subscribe(params => {
      this.organizationIdInternal = +params.get('organizationIdInternal');
      this.organizationIdClient = +params.get('organizationIdClient');

      const firstChildActive = this.route.firstChild;
      if (firstChildActive) {
        firstChildActive.paramMap.subscribe(params => {
          const childDocumentPublicId = params.get('docPublicId');
          if (childDocumentPublicId && childDocumentPublicId !== this.emptyGuid) {
            this.setActiveDocument(childDocumentPublicId);
          }
        });
      } else {
        const documentPublicId = params.get('documentPublicId');
        if (documentPublicId && documentPublicId !== this.emptyGuid) {
          this.setActiveDocument(documentPublicId);
        }
      }
    });

    this.detailService.refreshTotalsSubject.subscribe(documentPublicId => {
      this.downloadTotals(documentPublicId);
    });
  }

  setActiveDocument(documentPublicId) {
    this.active = this.documentList.find(doc => doc.id === documentPublicId);

    this.onDocumentSelected(this.active);
  }

  getAvailableActions(vmsDocumentId) {
    this.availableActions = null;
    this.workflowService.getAvailableStateActions(PhxConstants.EntityType.VmsDocument, vmsDocumentId).then(
      responseSucces => {
        if (responseSucces instanceof Array && responseSucces.length > 0) {
          const availableActions = responseSucces[0];

          if (availableActions.AvailableStateActions) {
            this.availableStateActions = availableActions.AvailableStateActions;
            this._initStateActions();
          }
        }
      },
      function(err) {}
    );
  }

  _initStateActions() {
    const self = this;
    self.stateActions = [
      {
        displayText: 'Process File',
        actionId: PhxConstants.StateAction.VmsDocumentProcess,
        style: StateActionButtonStyle.PRIMARY,
        disabledFn: function(action, componentOption) {
          return self.processing || !self.availableStateActions;
        },
        onClick: function(action, componentOption, actionOption) {
          self.processFile();
        }
      },
      {
        displayText: 'Reject File',
        actionId: PhxConstants.StateAction.VmsDocumentDiscard,
        style: StateActionButtonStyle.SECONDARY,
        disabledFn: function(action, componentOption) {
          return self.processing || !self.availableStateActions;
        },
        onClick: function(action, componentOption, actionOption) {
          self.rejectFile();
        }
      }
    ];
  }

  onDocumentSelected(vmsDoc) {
    this.vmsDocumentId = null;
    if (vmsDoc && vmsDoc.Document) {
      let entityType = null;
      switch (vmsDoc.Document.EntityTypeId) {
        case PhxConstants.EntityType.VmsImportedRecord:
          entityType = 'timesheet';
          break;
        case PhxConstants.EntityType.VmsDiscountImportedRecord:
          entityType = 'discount';
          break;
        case PhxConstants.EntityType.VmsExpenseImportedRecord:
          entityType = 'expense';
          break;
        case PhxConstants.EntityType.VmsCommissionImportedRecord:
          entityType = 'commission';
          break;
        case PhxConstants.EntityType.VmsFixedPriceImportedRecord:
          entityType = 'fixedprice';
          break;
        case PhxConstants.EntityType.VmsUnitedStatesSourceDeductionImportedRecord:
          entityType = 'unitedstatessourcededuction';
          break;
        default:
          break;
      }
      this.vmsDocumentId = vmsDoc.VmsDocumentId;
      this.getAvailableActions(vmsDoc.VmsDocumentId);
      // this.router.navigateByUrl will cause a problem in <app-phx-select>
      this.router.navigate(['./' + entityType + '/' + vmsDoc.DocumentPublicId], { relativeTo: this.route });
    } else {
      this.onDocumentRemoved();
    }
  }

  onDocumentRemoved() {
    this.availableStateActions = null;
    this.totalPending = null;
    this.totalConflict = null;
    this.totalDiscarded = null;

    if (this.documentList.length === 0) {
      // this.$state.go('vms.management', {}, { reload: true, inherit: true, notify: true });
      this.router.navigate(['/next', 'transaction', 'vms', 'management']);
    } else {
      this.router.navigate(['./timesheet/' + this.emptyGuid], { relativeTo: this.route });
    }
  }

  downloadTotals(documentPublicId) {
    const docId = documentPublicId;
    if (docId) {
      const oDataParams = oreq
        .request()
        .withSelect(['VmsDocumentId', 'DocumentPublicId', 'TotalPending', 'TotalConflict', 'TotalDiscarded'])
        .withFilter(oreq.filter('DocumentPublicId').eq("guid'" + docId + "'"))
        .url();
      this.vmsService.getVmsImportGroupedDocumentFilteredByInternalOrganizationAndClientOrganization(this.organizationIdInternal, this.organizationIdClient, oDataParams).then(
        (response: any) => {
          if (response.Items && response.Items.length) {
            const item = response.Items[0];
            this.totalPending = item.TotalPending;
            this.totalConflict = item.TotalConflict;
            this.totalDiscarded = item.TotalDiscarded;
          }
        },
        responseError => {}
      );
    }
  }

  rejectFile() {
    this.dialogService.confirm('Reject File', 'Are you sure you want to reject this file?').then(
      btn => {
        if (this.availableStateActions && this.availableStateActions.includes(PhxConstants.StateAction.VmsDocumentDiscard)) {
          this.processing = true;
          this.vmsService.rejectFile(PhxConstants.EntityType.VmsDocument, this.vmsDocumentId).then(
            responseSucces => {
              this.removeDocument(this.vmsDocumentId);
              this.processing = false;
            },
            responseError => {
              this.processing = false;
            }
          );
        }
      },
      btn => {
        this.processing = false;
      }
    );
  }

  processFile() {
    if (this.totalPending + this.totalConflict > 0) {
      if (this.availableStateActions) {
        this.processing = true;

        if (this.availableStateActions.includes(PhxConstants.StateAction.VmsDocumentProcess)) {
          this.vmsService.preProcessFile(PhxConstants.EntityType.VmsDocument, this.vmsDocumentId).then(
            (responseSucces: any) => {
              if (!responseSucces.IsValid) {
                return;
              }
              this.removeDocument(this.vmsDocumentId);
              this.processing = false;
            },
            responseError => {
              this.processing = false;
            }
          );
        }
      }
    } else if (this.totalDiscarded > 0) {
      this.dialogService.notify('File cannot be pre-processed', 'The file cannot be pre-processed because all the records are discarded.', { backdrop: 'static' });
    }
  }

  removeDocument(vmsDocumentId) {
    const items = _.filter(this.documentList, i => {
      const eq = i.VmsDocumentId !== vmsDocumentId;
      return eq;
    });
    this.documentList = items;
    this.active = [{ id: null, text: null }];
    this.onDocumentRemoved();
  }
}
