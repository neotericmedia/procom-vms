import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { PhxLocalizationService } from '../../services/phx-localization.service';
import { PhoenixCommonModuleResourceKeys } from './../../PhoenixCommonModule.resource-keys';

@Component({
  selector: 'app-phx-dialog-comment-template',
  templateUrl: './phx-dialog-comment-template.component.html',
  styleUrls: ['./phx-dialog-comment-template.component.less']
})
export class PhxDialogCommentTemplateComponent implements OnInit, OnDestroy {
  @Input() title: string;
  @Input() helpblock: string;
  @Input() label: string;
  @Input() maxLength: number = 4000;
  @Input() saveButtonText: string;
  @Input() saveCallbackFn: (comment: string) => void;
  @Input() cancelCallbackFn: () => void;
  @Input() modalRefHide: () => void;

  isAlive: boolean = true;
  yesFlag: boolean = false;

  comment: string;

  constructor(private localizationService: PhxLocalizationService) {
    this.title = this.localizationService.translate(PhoenixCommonModuleResourceKeys.phxDialogComment.title);
    this.helpblock = this.localizationService.translate(PhoenixCommonModuleResourceKeys.phxDialogComment.helpblock);
    this.saveButtonText = this.localizationService.translate(PhoenixCommonModuleResourceKeys.phxDialogComment.saveBtn);
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.isAlive = false;
  }

  updateComment(event: any) {
    this.comment = event;
  }

  save() {
    this.yesFlag = true;
    this.close();
    if (this.saveCallbackFn) {
      this.saveCallbackFn(this.comment);
    }
  }

  close() {
    if (this.modalRefHide) {
      this.modalRefHide();
    } else {
      console.error('modalRefHide is required');
    }
    if (this.yesFlag === false && this.cancelCallbackFn) {
      this.cancelCallbackFn();
    }
  }
}
