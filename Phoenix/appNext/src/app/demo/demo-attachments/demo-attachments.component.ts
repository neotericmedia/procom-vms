import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Demo, DemoService } from '../shared';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from '../../common/services/common.service';
import { PhxDocumentFileUploadConfiguration, PhxDocument, PhxDocumentFileUploaderOptions, PhxDocumentFileUploadFileItemActionEventArg } from '../../common/model';

@Component({
  selector: 'app-demo-attachments',
  templateUrl: './demo-attachments.component.html',
  styleUrls: ['./demo-attachments.component.less']
})
export class DemoAttachmentsComponent implements OnInit, OnDestroy {
  id: number;
  demo: Demo;
  editable: boolean = true;
  isAlive: boolean = true;
  documentList: Array<PhxDocument> = [];
  documentUploadConfiguration: PhxDocumentFileUploadConfiguration;
  documentDeleteConfiguration: any = <any>{
    action: null
  };
  fileUploadOptions: PhxDocumentFileUploaderOptions = {
    maxFileSize: (20 * 1024 * 1024), // 20971520 == 20 MB
    allowedFileType: [
      'compress',
      'xls',
      'ppt',
      'image',
      'pdf',
      'doc',
    ],
  };
  constructor(
    private commonService: CommonService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private demoService: DemoService,
  ) { }

  ngOnInit() {
    this.activatedRoute.parent.params
      .takeWhile(() => this.isAlive)
      .subscribe((params) => {
        this.id = +params['id'];
        this.loadDemo(this.id);
      });

  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  loadDemo(id: number, force: boolean = false) {
    this.demoService.getDemo(this.id, null, force)
      .takeWhile(() => this.isAlive)
      .subscribe((data) => {
        this.demo = data;
        this.setDemoEditableStatus(this.demo);
      });
  }

  setDemoEditableStatus(demo: Demo) {
    this.editable = true;
    this.documentUploadConfiguration = new PhxDocumentFileUploadConfiguration({
      UploadTitle: 'Upload dialog title',
      WorkflowPendingTaskId: -1,
      entityTypeId: this.commonService.ApplicationConstants.EntityType.Organization,
      entityId: 1,
      customId1: 0,
      customId2: 0,
      customMethodata: null,
      description: '',
      documentTypeId: this.commonService.ApplicationConstants.DocumentType.TimesheetSupportingDocument,
      // zip file is not supported https://github.com/valor-software/ng2-file-upload/issues/885
      SupportedFileExtensions: 'JPEG, JPG, PNG, PDF, TIF, DOC, DOCX, XLS, XLSX, RAR, 7Z, TXT'
    });
  }

  onUploadComplete() {

  }

  getUploadCompleteNotification(event: PhxDocumentFileUploadFileItemActionEventArg) {
    this.commonService.logSuccess('Upload success');
  }
}
