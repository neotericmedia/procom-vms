import { ValidationExtensions } from './../../common/components/phx-form-control/validation.extensions';
import { ComplianceDocumentService } from './../shared/compliance-document.service';
import { IComplianceDocumentHeader, IExpiryDateForm, IStateActionEvent } from './../shared/compliance-document.model';
import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { IComplianceDocument } from '../shared/compliance-document.model';
import { StateAction } from '../../common/model/state-action';
import { FormGroup, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { PhxButton, PhxConstants } from '../../common/model';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';

@Component({
  selector: 'app-compliance-document-expiry-date-modal',
  templateUrl: './compliance-document-expiry-date-modal.component.html',
  styleUrls: ['./compliance-document-expiry-date-modal.component.less']
})
export class ComplianceDocumentExpiryDateModalComponent implements OnInit {
  @ViewChild(PhxModalComponent) modal: PhxModalComponent;

  @Output() actionClick = new EventEmitter<IStateActionEvent>();

  action: StateAction;
  entity: IComplianceDocument;
  header: IComplianceDocumentHeader;

  form: FormGroup<IExpiryDateForm>;
  validationMessages: any;
  buttons: PhxButton[] = [
    {
      icon: null,
      tooltip: 'Ok',
      btnType: 'primary',
      disabled: () => !this.form || this.form.invalid,
      action: () => {
        const payload = this.getPayload();
        this.actionClick.emit({
          stateAction: this.action,
          entity: this.entity,
          header: this.header,
          payload: payload
        });

        this.modal.hide();
      },
    },
    {
      icon: null,
      tooltip: 'Cancel',
      btnType: 'default',
      action: () => {
        this.modal.hide();
      }
    }
  ];

  expiryDateLabel: string;
  commentLabel: string;

  maxExpiryDate: Date;

  constructor(private complianceDocumentService: ComplianceDocumentService, private fb: FormBuilder) { }

  ngOnInit() {
    this.buildForm();
  }

  open(action: StateAction, entity: IComplianceDocument, header: IComplianceDocumentHeader, maxExpiryDate?: Date) {
    this.action = action;
    this.entity = entity;
    this.header = header;
    this.maxExpiryDate = maxExpiryDate;
    this.updateControls(action.actionId, header, maxExpiryDate);
    this.reset();
    this.modal.show();
  }

  private buildForm() {
      this.form = this.fb.group<IExpiryDateForm>({
          ExpiryDate: null,
          Comment: [null, [ValidationExtensions.required(), ValidationExtensions.maxLength(236)]],
      });
  }

  private updateControls(action: PhxConstants.StateAction, header: IComplianceDocumentHeader, maxExpiryDate: Date) {
    const expiryDate = this.form.controls.ExpiryDate;
    // Expiry Date
    this.expiryDateLabel = action === PhxConstants.StateAction.ComplianceDocumentRequestSnooze ? 'Snooze Expiry Date' : 'Expiry Date';
    const expiryDateValidators = [];
    if (this.complianceDocumentService.isExpiryDateRequired(action, header.ComplianceDocumentRuleExpiryTypeId)) {
      expiryDateValidators.push(ValidationExtensions.required());
    }
    if (maxExpiryDate != null) {
      expiryDateValidators.push(ValidationExtensions.maxDate(maxExpiryDate, 'Date cannot exceed {0}')); // TODO: add default values to message provider
    }
    expiryDate.setValidators(expiryDateValidators);

    // Comment
    const comment = this.form.controls.Comment;
    if (this.complianceDocumentService.isCommentRequired(action)) {
      this.commentLabel = 'Snooze Comment';
      comment.enable();
    } else {
      comment.disable();
    }

  }

  private reset() {
    this.validationMessages = null;
    const expiryDate = this.entity.ComplianceDocumentSnoozeExpiryDate || this.entity.ComplianceDocumentExpiryDate;
    this.form.reset({ ExpiryDate: expiryDate });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  private getPayload() {
    if (this.action.actionId === PhxConstants.StateAction.ComplianceDocumentRequestSnooze || this.action.actionId === PhxConstants.StateAction.ComplianceDocumentApproveSnooze) {
      return {
        SnoozeExpiryDate: this.form.value.ExpiryDate,
        Comment: this.form.value.Comment,
      };
    } else {
      return {
        ...this.form.value
      };
    }
  }

}
