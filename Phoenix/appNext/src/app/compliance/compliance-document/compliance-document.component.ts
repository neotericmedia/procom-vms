import { CommandResponse } from './../../common/model/command-response';
import { ConstStateActionSuccessMessages } from './../compliance-module-resource-keys';
import { LoadingSpinnerService } from './../../common/loading-spinner/service/loading-spinner.service';
import { ComplianceDocumentExpiryDateModalComponent } from '../compliance-document-expiry-date-modal/compliance-document-expiry-date-modal.component';

// declare const angular: angular.IAngularStatic;
import { Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter, Input, SimpleChanges, OnChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
// fix me
import { saveAs } from 'file-saver';

// common
import { ApiService } from '../../common/services/api.service';
import { CommonService, WindowRefService, DialogService } from '../../common/index';
import { PhxConstants } from '../../common/PhoenixCommon.module';
import { PhxWorkflowEventHistoryComponent } from '../../common/components/phx-workflow-event-history/phx-workflow-event-history.component';

import {
    IComplianceDocumentDto,
    ComplianceDocumentCallBackModel,
    IComplianceDocumentEntityGroup,
    IComplianceDocument,
    IComplianceDocumentHeader,
    IStateActionEvent,
} from '../shared/compliance-document.model';

import { ComplianceDocumentService } from '../shared/compliance-document.service';
import { PhxDocumentFileUploadConfiguration, PhxDocumentFileUploaderOptions, PhxDocumentFileUploadFileItemActionEventArg, DialogOptions, DialogResultType } from '../../common/model/index';
import { PhxDocumentFileUploadComponent } from '../../common/components/phx-document-file-upload/phx-document-file-upload.component';
import { StateAction } from '../../common/model/state-action';
import { ComplianceDocumentDialogComplianceTemplateComponent } from '../compliance-document-dialog-compliance-template/compliance-document-dialog-compliance-template.component';

const ConstType = PhxConstants.ComplianceTemplateDocumentType;
const ConstStateAction = PhxConstants.StateAction;
const ComplianceDocumentStatus = PhxConstants.ComplianceDocumentStatus;

@Component({
    selector: 'app-compliance-document',
    templateUrl: './compliance-document.component.html',
    styleUrls: ['./compliance-document.component.less']
})
export class ComplianceDocumentComponent implements OnInit, OnDestroy, OnChanges {
    @Input() entityTypeId: PhxConstants.EntityType;
    @Input() entityId: number;
    @Input() entityName: string;
    @Input() triggerToRefresh: string;
    @Input() referenceEntityLink: string;
    @Input() maxSnoozeExpiryDate: Date | string;
    @Input() useBoldHeading = false;

    @ViewChild(PhxDocumentFileUploadComponent) complianceDocumentFileUploadComponent: PhxDocumentFileUploadComponent;
    @ViewChild(ComplianceDocumentExpiryDateModalComponent) expiryDateModal: ComplianceDocumentExpiryDateModalComponent;
    @ViewChild(PhxWorkflowEventHistoryComponent) workflowEventHistory: PhxWorkflowEventHistoryComponent;
    @ViewChild('complianceDocumentDialogComplianceTemplate') complianceDocumentTemplateSelectModal: ComplianceDocumentDialogComplianceTemplateComponent;

    @Output() complianceDocumentOutput: EventEmitter<ComplianceDocumentCallBackModel> = new EventEmitter<ComplianceDocumentCallBackModel>();
    // TYPE - any
    state: any;
    stateParams: any;
    codeValueGroups: any;
    unregisterList: any[] /*TODO: change resolve of onPrivate to Subscription*/ = [];

    isAlive: boolean = true;
    parentEntityHasNoApplicableComplianceDocuments: boolean = false;

    documentEntityGroups: IComplianceDocumentEntityGroup [];
    documentEntityGroupsWithTemplates: IComplianceDocumentEntityGroup[];
    documentEntityGroupsWithSamples: IComplianceDocumentEntityGroup[];

    documentListView: {
        complianceDocumentHeader: IComplianceDocumentHeader,
        complianceDocument: IComplianceDocument,
        documents: Array<any>,
        // src: SafeResourceUrl - is disabled because
        // will be used 'DownloadFileStreamEvent' to get PDF in time of Handler execution
        // but signalR can be early then workflow finish
        // then on close need to _onInit() to get updated WorkflowTaskId
    } = null;

    complianceDocumentFileUploadConfiguration: PhxDocumentFileUploadConfiguration;
    fileUploaderOptions_DocumentMain: PhxDocumentFileUploaderOptions;

    isSignalRActivated: boolean = false;

    constructor(
        private apiService: ApiService,
        private commonService: CommonService,
        private complianceDocumentService: ComplianceDocumentService,
        private dialogService: DialogService,
        private domSanitizer: DomSanitizer,
        private winRef: WindowRefService,
        private loadingSpinnerService: LoadingSpinnerService
    ) {
        // fix me
        this.state = null; // $state;
        this.stateParams = null; // $stateParams;
        this.codeValueGroups = this.commonService.CodeValueGroups;
        this.fileUploaderOptions_DocumentMain = {
            queueLimit: 10,
            maxFileSize: (20 * 1024 * 1024), // 20971520 == 20 MB
            allowedMimeType: [
                // https://github.com/valor-software/ng2-file-upload/issues/661
                // 'image/gif',
                // 'text/csv',
                // 'application/vnd.ms-excel',
                'image/jpg',
                'image/jpeg',
                'image/png',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ],
            allowedFileType: [
                // https://github.com/valor-software/ng2-file-upload/issues/696
                // 'application',
                // 'video',
                // 'audio',
                // 'compress',
                // 'xls',
                // 'ppt',
                'image',
                'pdf',
                'doc',
            ],
        };
    }

    private initSignalR() {
        if (!this.isSignalRActivated) {
            this.isSignalRActivated = true;

            this.apiService
                .onPrivate('DownloadFileStreamEvent', (event, data) => {
                    if (data.StateActionId === ConstStateAction.ComplianceDocumentGenerateDocument ||
                        data.StateActionId === ConstStateAction.ComplianceDocumentViewSample
                    ) {
                        if (data.ValidationMessages && data.ValidationMessages.length > 0) {
                            this.commonService.logValidationMessages(data.ValidationMessages);
                        } else {
                            // http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
                            const byteCharacters = atob(data.FileStream);
                            const byteNumbers = new Array(byteCharacters.length);
                            for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }
                            const byteArray = new Uint8Array(byteNumbers);
                            const blob = new Blob([byteArray], { type: data.FileContentType + ';charset=' + data.FileCharset + ';' });
                            // https://stackoverflow.com/questions/40782331/use-filesaver-js-with-angular2
                            // setTimeout(() => { saveAs(blob, data.FileName); }, 1000);
                            saveAs(blob, `${this.entityName}-${data.FileName}`);
                        }
                    }
                })
                .then((unregister) => {
                    // http://es6-features.org/#Lexicalthis
                    if (unregister) {
                        this.unregisterList.push(unregister);
                    }
                })
                .catch(ex => {
                    console.error('DownloadFileStreamEvent registration exception: ' + ex);
                });

            this.apiService
                .onPrivate('DownloadListFileStreamEvent', (event, data) => {
                    if (data.StateAction === ConstStateAction.ComplianceDocumentView ||
                        data.StateAction === ConstStateAction.ComplianceDocumentViewSample
                    ) {
                        // http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
                        const byteCharacters = atob(data.Documents[0].FileStream);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: data.Documents[0].FileContentType + ';charset=' + data.Documents[0].FileCharset + ';' });
                        // https://stackoverflow.com/questions/40782331/use-filesaver-js-with-angular2
                        saveAs(blob, data.Documents[0].FileName);
                    } else if (this.documentListView != null) {
                        this.documentListView.documents = data.Documents
                            .map(document => ({
                                DocumentName: document.FileName,
                                DocumentSrc: this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.commonService.api2Url}${'api/document'}/${document.FilePublicId}/getPdfStreamByPublicId?access_token=${this.commonService.bearerToken()}`)
                            }))
                            ;
                        // this.iframeComplianceDocumentListViewFileStream.nativeElement.setAttribute('src', 'data:' + data.Documents[0].FileContentType + ';base64,' + data.Documents[0].FileStream);
                    }
                })
                .then((unregister) => {
                    // http://es6-features.org/#Lexicalthis
                    if (unregister) {
                        this.unregisterList.push(unregister);
                    }
                })
                .catch(ex => {
                    console.error('DownloadListFileStreamEvent registration exception: ' + ex);
                });

            this.apiService.onPublic('ComplianceDocumentEvent', (event, data) => {
                // TODO: change this to use ApiService.ConcurrencyNotify, only if it's by the same person viewing???
                if (!data.IsOwner && this.hasComplianceDoc(data.ComplianceDocumentId)) {
                    const successMessage = ConstStateActionSuccessMessages[data.StateActionId];
                    switch (data.StateActionId) {
                        case ConstStateAction.ComplianceDocumentApprove:
                            this.commonService.logSuccess(successMessage);
                            this.updateComplianceDocument(data.ComplianceDocumentId);
                            break;
                        case ConstStateAction.ComplianceDocumentDecline:
                            this.commonService.logSuccess(successMessage);
                            // we cannot updateComplianceDoc here because workflow is creating a new ComplianceDocument after declined, the ComplianceDocumentId will be different.
                            this._onInit('ComplianceDocumentDeclineState | ComplianceDocumentDeclineExemptionState');
                            break;
                    }
                    console.log('Complience Document: [' + new Date().toISOString().slice(11, -5) + '] - Signalr on public respond:' + data.ReferenceCommandName);
                    // this._onInit(null, 'onPublic');
                }
            }).then((unregister) => {
                if (unregister) {
                    this.unregisterList.push(unregister);
                }
            }).catch(ex => {
                console.error('ComplianceDocumentEvent exception: ' + ex);
                });

        }
    }

    identifyEntityGroup(index, entityGroup: IComplianceDocumentEntityGroup) {
        return `${entityGroup.EntityTypeId}.${entityGroup.EntityId}`;
    }

    hasComplianceDoc(complianceDocId: number): boolean {
        return this.documentEntityGroups.some(entityGroup =>
            entityGroup.Headers.some(header => header.ComplianceDocumentCurrent.Id === complianceDocId
                || header.PreviousDocuments.some(x => x.Id === complianceDocId)
                )
        );
    }

    updateComplianceDocument(complianceDocId: number) {
        if (this.hasComplianceDoc(complianceDocId)) {
            this.complianceDocumentService.loadComplianceDoc(complianceDocId).takeWhile(() => this.isAlive).subscribe(
                (res: IComplianceDocumentDto) => {
                    this.complianceDocumentService.updateState(res);
                });
        }
    }

    public ngOnDestroy() {
        this.complianceDocumentService.clearList();
        this.isAlive = false;
        if (this.unregisterList && this.unregisterList.length) {
            for (const sub of this.unregisterList) {
              if (sub && sub.unsubscribe) {
                sub.unsubscribe();
              }
            }
        }
    }

    public ngOnInit() {
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.entityTypeId || changes.entityId || changes.triggerToRefresh) {
            this._onInit('ngOnChanges');
        }
    }

    private _onInit(funcName: string): void {
        console.log('Complience Document: [' + new Date().toISOString().slice(11, -5) + '] - _onInit start in ' + funcName);

        const isSupportedState = false;
        this.complianceDocumentService.clearList();

        if (this.entityTypeId > 0 && this.entityId > 0) {
            this.complianceDocumentService
                .loadList(this.entityTypeId, this.entityId)
                .takeWhile(() => this.isAlive)
                .subscribe(items => {
                    let allComplianceDocumentsAreValidForSubmission = true;
                    if (items != null && items.length > 0) {
                        this.initSignalR();
                        items.forEach((item) => {
                            if (item.ComplianceDocumentStatusId === ComplianceDocumentStatus.PendingUpload
                                && item.ComplianceDocumentRuleRequiredTypeId !== PhxConstants.ComplianceDocumentRuleRequiredType.Optional
                            ) {
                                allComplianceDocumentsAreValidForSubmission = false;
                            }
                        });
                        const headers = this.complianceDocumentService.getComplianceDocumentHeaders(items);
                        this.documentEntityGroups = this.complianceDocumentService.groupHeadersByEntity(headers);
                        this.documentEntityGroupsWithTemplates = this.complianceDocumentService.getFilteredDocumentEntityGroupsForTemplateType(this.documentEntityGroups, PhxConstants.ComplianceTemplateDocumentType.Template);

                        this.parentEntityHasNoApplicableComplianceDocuments = false;
                        const complianceDocumentCallBackEmitterObj: ComplianceDocumentCallBackModel = {
                            AllComplianceDocumentsAreValidForSubmission: allComplianceDocumentsAreValidForSubmission,
                            ParentEntityHasNoApplicableComplianceDocuments: false
                        };
                        this.complianceDocumentOutput.emit(complianceDocumentCallBackEmitterObj);
                    } else if (items != null && items.length === 0) {
                        this.parentEntityHasNoApplicableComplianceDocuments = true;
                        const complianceDocumentCallBackEmitterObj: ComplianceDocumentCallBackModel = {
                            AllComplianceDocumentsAreValidForSubmission: allComplianceDocumentsAreValidForSubmission,
                            ParentEntityHasNoApplicableComplianceDocuments: true
                        };
                        this.complianceDocumentOutput.emit(complianceDocumentCallBackEmitterObj);
                    }
                    console.log('Complience Document: [' + new Date().toISOString().slice(11, -5) + '] - _onInit data loaded');
                });
        }
    }

    onStateAction(event: IStateActionEvent) {
        const stateAction = event.stateAction;
        const entity = event.entity;
        const header = event.header;
        const payload = event.payload;
        const successMessage = event.successMessage;

        const expiryModalActions = [PhxConstants.StateAction.ComplianceDocumentRequestSnooze, PhxConstants.StateAction.ComplianceDocumentApproveSnooze];
        const documentListViewActions = [PhxConstants.StateAction.ComplianceDocumentViewSample, PhxConstants.StateAction.ComplianceDocumentView];

        if (documentListViewActions.includes(stateAction.actionId)) {
            this.documentListView = {
                complianceDocumentHeader: header,
                complianceDocument: entity,
                documents: null
            };
        }
        if (stateAction.actionId === ConstStateAction.ComplianceDocumentUploadDocument) {
            this.uploadDocument(entity, header);
        } else if (stateAction.actionId === ConstStateAction.ComplianceDocumentRequestExemption) {
            this.uploadExemption(entity);
        } else if (stateAction.actionId === PhxConstants.StateAction.ComplianceDocumentView) {
            this.winRef.nativeWindow.open
                (`#/next/compliance/document-view?id=${entity.Id}&entitytypeid=${this.entityTypeId}&entityid=${this.entityId}`, '_blank');
        } else if (expiryModalActions.includes(stateAction.actionId)) {
            this.showExpiryDateModal(stateAction, entity, header);
        } else {
            this.showConfirmDialog(stateAction)
            .then(() => {
                this.executeStateAction(stateAction, entity, header, payload, successMessage);
            });
        }
    }

    onExpiryDateModalConfirm(event: IStateActionEvent) {
        this.executeStateAction(event.stateAction, event.entity, event.header, event.payload, event.successMessage);
    }

    uploadDocument(complianceDocument: IComplianceDocument, complianceDocumentHeader: IComplianceDocumentHeader) {
        this.fileUploaderOptions_DocumentMain.queueLimit = 10;
        this.complianceDocumentFileUploadConfiguration = {
            entityTypeId: PhxConstants.EntityType.ComplianceDocument
            , entityId: complianceDocument.Id
            , documentTypeId: PhxConstants.DocumentType.ComplianceDocumentMain
            , UploadTitle: `Upload <strong>${complianceDocumentHeader.ComplianceDocumentRuleDisplayName}</strong> ${(this.entityName && this.entityName.trim()) ? 'for ' + this.entityName : ''}`
            , SupportedFileExtensions: 'JPEG, JPG, PNG, PDF, DOC, DOCX'
            , customUiConfig: {
                objectDate: complianceDocumentHeader.ComplianceDocumentRuleExpiryTypeId === PhxConstants.ComplianceDocumentRuleExpiryType.None
                    ? null
                    : {
                        value: complianceDocument.ComplianceDocumentExpiryDate,
                        isRequared: complianceDocumentHeader.ComplianceDocumentRuleExpiryTypeId === PhxConstants.ComplianceDocumentRuleExpiryType.UserDefinedMandatory,
                        label: 'Expiry Date',
                        helpBlock: 'Expiry Date must be entered'
                    },
                objectComment: null
            }
        };
        // setWatchConfigOnWorkflowEvent will be activated on callBackOnFileUploadBegin
        // this.setWatchConfigOnWorkflowEvent(complianceDocument.ComplianceDocumentId, '');
        // this.complianceDocumentService.setComplianceDocumentLastExecutedCommandName(action.CommandName);
        this.complianceDocumentFileUploadComponent.showModal(this.fileUploaderOptions_DocumentMain);
    }

    uploadExemption(complianceDocument: IComplianceDocument) {
        this.fileUploaderOptions_DocumentMain.queueLimit = 1;
        this.complianceDocumentFileUploadConfiguration = {
            entityTypeId: PhxConstants.EntityType.ComplianceDocument
            , entityId: complianceDocument.Id
            , documentTypeId: PhxConstants.DocumentType.ComplianceDocumentExemption
            , UploadTitle: 'Upload an Exemption document to your Compliance Document'
            , SupportedFileExtensions: 'JPEG, JPG, PNG, PDF, DOC, DOCX'
            , customUiConfig: {
                objectDate: null,
                objectComment: { value: '', isRequared: true, label: 'Exemption Comment', helpBlock: 'Exemption Comment must be entered', minlength: 3, maxlength: 256 }
            }
        };
        // setWatchConfigOnWorkflowEvent will be activated on callBackOnFileUploadBegin
        // this.setWatchConfigOnWorkflowEvent(complianceDocument.ComplianceDocumentId, '');
        this.complianceDocumentFileUploadComponent.showModal(this.fileUploaderOptions_DocumentMain);
    }

    showConfirmDialog(action: StateAction, msg?: string) {
        let dialogMsg: string;
        let dialogOptions: DialogOptions = {};
        if (msg) {
            dialogMsg = msg;
            dialogOptions = {
                size: 'md'
            };
        } else {
            dialogMsg = `Are you sure you want to ${action.displayText.toLowerCase()}?`;
        }
        return new Promise((resolve, reject) => {
            this.dialogService.confirm(action.displayText, dialogMsg, dialogOptions)
                .then((button) => {
                    if (button === DialogResultType.Yes) {
                        resolve();
                    } else {
                        reject();
                    }
                });
        });
    }

    executeStateAction(action: StateAction, entity: IComplianceDocument, header: IComplianceDocumentHeader, payload: any, successMessage?: string) {

        const commandBody = {
            ComplianceDocumentId: entity.Id,
            EntityTypeId: this.entityTypeId,
            EntityId: this.entityId,
            ...payload
        };

        if (!successMessage) {
            successMessage = ConstStateActionSuccessMessages[action.actionId];
        }

        return new Promise((resolve, reject) => {
            this.loadingSpinnerService.show();
            this.complianceDocumentService.executeStateCommand(action.commandName, commandBody)
            .then((response) => {
                if (successMessage) {
                    this.commonService.logSuccess(successMessage);
                }

                this.loadingSpinnerService.hide();

                this.reloadOnStateActionSuccess(entity.Id, response);

                resolve();
            })
            .catch(ex => {
                this.loadingSpinnerService.hideAll();
                this.commonService.logError(ex);
                reject();
            });
        });
    }

    reloadOnStateActionSuccess(entityId: number, response: CommandResponse) {
        if (response && response.EntityTypeIdRedirect === PhxConstants.EntityType.ComplianceDocument && response.EntityIdRedirect > 0) {
            this._onInit('executeStateAction');
        } else {
            this.updateComplianceDocument(entityId);
        }
    }

    private showExpiryDateModal(action: StateAction, entity: IComplianceDocument, header: IComplianceDocumentHeader) {
        if (action.actionId === PhxConstants.StateAction.ComplianceDocumentRequestSnooze || action.actionId === PhxConstants.StateAction.ComplianceDocumentApproveSnooze) {
            if (typeof this.maxSnoozeExpiryDate === 'string') { // TODO: enforce Date type input?
                const date = this.complianceDocumentService.mapDate(this.maxSnoozeExpiryDate);
                this.expiryDateModal.open(action, entity, header, date);
            } else {
                this.expiryDateModal.open(action, entity, header, this.maxSnoozeExpiryDate);
            }
        } else {
            this.expiryDateModal.open(action, entity, header);
        }
    }

    callBackOnFileUploadClose(event: any) {
    }
    callBackOnFileUploadBegin(event: any) {
        console.log('Complience Document: [' + new Date().toISOString().slice(11, -5) + '] - callBackOnFileUploadBegin');
    }
    callBackOnFileUploadFinish(event: PhxDocumentFileUploadFileItemActionEventArg) {
        const complianceDocumentId: number =
            this.complianceDocumentFileUploadConfiguration !== null
                && this.complianceDocumentFileUploadConfiguration.entityTypeId === PhxConstants.EntityType.ComplianceDocument
                && this.complianceDocumentFileUploadConfiguration.entityId > 0
                ? this.complianceDocumentFileUploadConfiguration.entityId
                : null;
        this.complianceDocumentFileUploadConfiguration = null;
        if (event && event.response) {
            this.commonService.logSuccess(`${event.item.file.name} uploaded successfully.`, event);
            this.reloadOnStateActionSuccess(complianceDocumentId, event.response.commandResult);
        }

        // this._onInit(complianceDocumentId, 'callBackOnFileUploadFinish');
        console.log('Complience Document: [' + new Date().toISOString().slice(11, -5) + '] - callBackOnFileUploadFinish');
    }

    onGenerateDocument(event: IStateActionEvent) {
        this.openComplianceTemplateSelectModalForStateAction(event);
    }
    onGenerateAllDocuments() {
        this.openComplianceTemplateSelectModal(PhxConstants.StateAction.ComplianceDocumentGenerateDocument, this.documentEntityGroupsWithTemplates);
    }

    onViewSample(event: IStateActionEvent) {
        this.openComplianceTemplateSelectModalForStateAction(event);
    }
    onViewAllSamples() {
        this.openComplianceTemplateSelectModal(PhxConstants.StateAction.ComplianceDocumentViewSample, this.documentEntityGroupsWithSamples);
    }

    private openComplianceTemplateSelectModalForStateAction(event: IStateActionEvent) {
        const templateGroup = this.complianceDocumentService.getFilteredDocumentEntityGroupsForTemplateAction(event.stateAction.actionId, this.documentEntityGroups, event.header.Id);
        this.openComplianceTemplateSelectModal(event.stateAction.actionId, templateGroup);
    }

    private openComplianceTemplateSelectModal(action: PhxConstants.StateAction, entityGroups: IComplianceDocumentEntityGroup[]) {
        this.complianceDocumentTemplateSelectModal.onInit(action, entityGroups);
        this.complianceDocumentTemplateSelectModal.show();
    }

    complianceDocumentDialogComplianceTemplateOnClickEvent() {
        this.complianceDocumentTemplateSelectModal.hide();
    }
}
