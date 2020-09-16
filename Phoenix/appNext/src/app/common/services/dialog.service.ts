import { Injectable, Inject } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap';
import { ModalOptions, BsModalRef } from 'ngx-bootstrap/modal';
import { DialogResultType, DialogOptions } from '../model/index';
import { PhxLocalizationService } from './phx-localization.service';
import { PhxDialogConfirmTemplateComponent } from './../components/phx-dialog-confirm-template/phx-dialog-confirm-template.component';
import { PhxDialogWaitTemplateComponent } from './../components/phx-dialog-wait-template/phx-dialog-wait-template.component';
import { PhxDialogErrorTemplateComponent } from '../components/phx-dialog-error-template/phx-dialog-error-template.component';
import { PhxDialogNotifyTemplateComponent } from '../components/phx-dialog-notify-template/phx-dialog-notify-template.component';
import { PhxDialogCommentTemplateComponent } from './../components/phx-dialog-comment-template/phx-dialog-comment-template.component';
import { PhoenixCommonModuleResourceKeys } from './../PhoenixCommonModule.resource-keys';

@Injectable()
export class DialogService {
  constructor(private locale: PhxLocalizationService, private modalService: BsModalService) {}

  error(title?: string, message?: string, dialogOptions?: DialogOptions) {
    const modalOption: ModalOptions = this.getModalOption(dialogOptions);
    modalOption.initialState = {
      title: title || this.locale.translate('common.generic.error'),
      message: message || 'An unknown error has occurred.'
    };
    const modalRef: BsModalRef = this.modalService.show(PhxDialogErrorTemplateComponent, modalOption);
    modalRef.content.modalRefHide = () => modalRef.hide();
  }

  wait(title?: string, message?: string, getProgressFn?: () => number, dialogOptions?: DialogOptions) {
    const modalOption: ModalOptions = this.getModalOption(dialogOptions);
    modalOption.initialState = {
      title: title || 'Please Wait...',
      message: message || 'Waiting on operation to complete.',
      getProgressFn: getProgressFn || null
    };
    const modalRef: BsModalRef = this.modalService.show(PhxDialogWaitTemplateComponent, modalOption);
    modalRef.content.modalRefHide = () => modalRef.hide();
  }

  notify(title?: string, message?: string, dialogOptions?: DialogOptions) {
    return new Promise((resolve, reject) => {
      const modalOption: ModalOptions = this.getModalOption(dialogOptions);
      modalOption.initialState = {
        title: title || 'Notification',
        message: message || 'Unknown application notification.',
        callbackFn: () => resolve()
      };
      const modalRef: BsModalRef = this.modalService.show(PhxDialogNotifyTemplateComponent, modalOption);
      modalRef.content.modalRefHide = () => modalRef.hide();
    });
  }

  confirm(title?: string, message?: string, dialogOptions?: DialogOptions): Promise<DialogResultType> {
    return new Promise((resolve, reject) => {
      const modalOption: ModalOptions = this.getModalOption(dialogOptions);
      modalOption.initialState = {
        title: title || 'Confirmation',
        message: message || 'Confirmation required.',
        yesCallbackFn: () => resolve(DialogResultType.Yes),
        noCallbackFn: () => reject(DialogResultType.No)
      };
      const modalRef: BsModalRef = this.modalService.show(PhxDialogConfirmTemplateComponent, modalOption);
      modalRef.content.modalRefHide = () => modalRef.hide();
    });
  }

  confirmDelete(message: string = this.locale.translate('common.dialog.confirmDeleteMessage')) {
    return this.confirm(this.locale.translate('common.dialog.confirmDeleteTitle'), message);
  }

  comment(title?: string, helpblock?: string, label?: string, maxLength?: number, saveButtonText?: string, dialogOptions?: DialogOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      const modalOption: ModalOptions = this.getModalOption(dialogOptions);
      modalOption.initialState = {
        title: title || this.locale.translate(PhoenixCommonModuleResourceKeys.phxDialogComment.title),
        helpblock: helpblock || this.locale.translate(PhoenixCommonModuleResourceKeys.phxDialogComment.helpblock),
        label: label,
        maxLength: maxLength || 4000,
        saveButtonText: saveButtonText || this.locale.translate(PhoenixCommonModuleResourceKeys.phxDialogComment.saveBtn),
        saveCallbackFn: (comment: string) => resolve(comment),
        cancelCallbackFn: () => reject()
      };
      const modalRef: BsModalRef = this.modalService.show(PhxDialogCommentTemplateComponent, modalOption);
      modalRef.content.modalRefHide = () => modalRef.hide();
    });
  }

  private getModalOption(dialogOption: DialogOptions = {}) {
    return <ModalOptions>{
      backdrop: dialogOption.hasOwnProperty('backdrop') ? dialogOption.backdrop : true,
      class: `modal-${dialogOption.size || 'sm'} ${dialogOption.windowClass || ''}`,
      animated: dialogOption.animation || false,
      ignoreBackdropClick: true,
      keyboard: false
    };
  }
}
