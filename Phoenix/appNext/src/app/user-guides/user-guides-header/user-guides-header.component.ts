import { Component, OnInit, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { UserGuideHeader } from '../model/user-guide-header';

@Component({
  selector: 'app-user-guides-header',
  templateUrl: './user-guides-header.component.html',
  styleUrls: ['./user-guides-header.component.less']
})
export class UserGuidesHeaderComponent implements OnInit {
  @Input()
  userGuidesHeader: UserGuideHeader;

  @Input()
  showAdministrationView: boolean = false;
  constructor() {}

  @Output()
  uploadFile: EventEmitter<number> = new EventEmitter();
  @Output()
  deleteFile: EventEmitter<{ Id: number; LastModifiedDatetime: Date }> = new EventEmitter();

  ngOnInit() {}

  startUpload() {
    this.uploadFile.emit(this.userGuidesHeader.UserGuidesHeaderId);
  }

  deletedFile(event) {
    this.deleteFile.emit(event);
  }
}
