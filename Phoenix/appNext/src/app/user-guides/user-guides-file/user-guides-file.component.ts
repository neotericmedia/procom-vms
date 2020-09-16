import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserGuidesService } from '../user-guides.service';
import { UserGuideFile } from '../model/user-guide-file';

@Component({
  selector: 'app-user-guides-file',
  templateUrl: './user-guides-file.component.html',
  styleUrls: ['./user-guides-file.component.less']
})
export class UserGuidesFileComponent implements OnInit {
  @Input()
  userGuidesFile: UserGuideFile;
  @Input()
  showAdministrationView = false;

  @Output()
  deletedFile: EventEmitter<{ Id: number; LastModifiedDatetime: Date }> = new EventEmitter();

  permissionLabel: string = '';

  constructor(private userGuidesService: UserGuidesService) {}

  ngOnInit() {
    this.permissionLabel = this.userGuidesService.createPermissionLabelForFile(this.userGuidesFile);
    this.userGuidesFile.link = this.userGuidesService.createSanitizedPdfDocumentLink(this.userGuidesFile.PublicId);
  }

  deleteFile() {
    this.userGuidesService
      .createConfirmDeleteDialog()
      .then(() => {
        this.deletedFile.emit({ Id: this.userGuidesFile.Id, LastModifiedDatetime: this.userGuidesFile.LastModifiedDatetime });
      })
      .catch(e => {
        console.log(e);
      });
  }
}
