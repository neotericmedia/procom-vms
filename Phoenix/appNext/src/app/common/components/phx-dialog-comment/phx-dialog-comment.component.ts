import { DialogComment, DialogResultType } from './../../model/index';
import { DebounceDirective } from './../../directives/debounce.directive';
import { Component, OnInit, Input, Inject, EventEmitter, Output, ViewChild } from '@angular/core';
import { PhxLocalizationService } from '../../services/phx-localization.service';
import { PhoenixCommonModuleResourceKeys } from '../../PhoenixCommonModule.resource-keys';

@Component({
  selector: 'app-phx-dialog-comment',
  templateUrl: './phx-dialog-comment.component.html',
  styleUrls: ['./phx-dialog-comment.component.less']
})
export class PhxDialogCommentComponent implements OnInit {

  @Input() title: string;
  @Input() inputname: string = '';
  @Input() helpblock: string;
  @Input() saveButtonText: string;
  @Input() cancelButtonText: string;
  @Input() saveButtonClass: string = 'default';
  @Input() maxLength: number = 4000;

  @ViewChild('dialogCommentModal') modalRef: any;
  @Output() onclose: EventEmitter<any> = new EventEmitter();

  comment: string;

  constructor(private localizationService: PhxLocalizationService) {
    // Defaults
    this.title = this.localizationService.translate(PhoenixCommonModuleResourceKeys.phxDialogComment.title);
    this.helpblock = this.localizationService.translate(PhoenixCommonModuleResourceKeys.phxDialogComment.helpblock);
    this.saveButtonText = this.localizationService.translate(PhoenixCommonModuleResourceKeys.phxDialogComment.saveBtn);
    this.cancelButtonText = this.localizationService.translate(PhoenixCommonModuleResourceKeys.phxDialogComment.cancelBtn);
  }

  ngOnInit() {
  }

  public open() {
    this.modalRef.show();
  }

  updateComment(event: any) {
    this.comment = event;
  }

  save() {
    if (this.comment && this.comment.trim().length > 0) { // TODO: validation
      this.close();
    }
  }

  cancel() {
    this.close(true);
  }

  private close(isCancel: boolean = false) {
    this.modalRef.hide();

    const result: DialogComment = {
      ResultType: !isCancel ? DialogResultType.OK : DialogResultType.Close,
      Comment: !isCancel ? this.comment : null
    };
    this.onclose.emit(result);

    this.comment = null;
  }
}
