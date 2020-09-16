import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-phx-profile-picture',
  templateUrl: './phx-profile-picture.component.html',
  styleUrls: ['./phx-profile-picture.component.less']
})
export class PhxProfilePictureComponent implements OnChanges {

  @Input() profileId: number;
  public profilePictureUrl: string;
  constructor(private documentService: DocumentService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.profileId != null) {
      this.setUserProfilePicture();
    }
  }

  setUserProfilePicture() {
    this.documentService.getProfilePicture(this.profileId).then(imageUrl => {
      this.profilePictureUrl = imageUrl;
    });
  }
}
