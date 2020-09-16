import { PhxDocumentFileUploadConfiguration } from './../../common/model/document-file-upload/phx-document-file-upload-configuration';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationService } from './../../common/services/navigation.service';
import { UserGuidesService } from '../user-guides.service';
import { PhxDocumentFileUploadComponent } from '../../common/components/phx-document-file-upload/phx-document-file-upload.component';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ValidationExtensions } from '../../common';
import { UserGuideHeader } from '../model/user-guide-header';

@Component({
  selector: 'app-user-guides',
  templateUrl: './user-guides.component.html',
  styleUrls: ['./user-guides.component.less']
})
export class UserGuidesComponent implements OnInit {
  @ViewChild(PhxDocumentFileUploadComponent)
  uploader: PhxDocumentFileUploadComponent;

  private alive: boolean = true;
  userGuidesHeaders: Array<UserGuideHeader> = [];
  hasAdministratorView: boolean = false;
  showAdminsitratorView: boolean = false;
  form: FormGroup;
  permissions = this.initializePermissions();

  documentUploadConfiguration: PhxDocumentFileUploadConfiguration;
  isAlive: boolean = true;

  constructor(private navigationService: NavigationService, private userGuidesService: UserGuidesService, private formBuilder: FormBuilder) {
    this.documentUploadConfiguration = this.userGuidesService.getDocumentUploadConfiguration();
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      fileName: ['', [Validators.required]],
      description: ['', [Validators.maxLength(900)]],
      permissionsControl: this.formBuilder.group(
        {
          internal: ['', []],
          worker: ['', []],
          organization: ['', []]
        },
        { validator: ValidationExtensions.custom(this.oneOrMoreViewerIsSelected.bind(this), this.userGuidesService.viewerNotSelectedError()) }
      )
    });
    this.navigationService.setTitle('user-guides');
    this.hasAdministratorView = this.userGuidesService.isEditButtonShown();
    this.fetchUserGuides();
  }

  public onUploadAllComplete(): void {
    this.form.reset();
    this.permissions = this.initializePermissions();
    this.fetchUserGuides();
  }

  public changeToAdministratorView(): void {
    this.showAdminsitratorView = !this.showAdminsitratorView;
    this.fetchUserGuides();
  }

  public startUploadFile(userGuideHeaderId): void {
    this.documentUploadConfiguration.customId1 = userGuideHeaderId;
    this.uploader.showModal({ queueLimit: 1 });
  }

  public deleteFile(fileToDelete): void {
    this.userGuidesService.deleteFile(fileToDelete).then(() => this.fetchUserGuides());
  }

  public checkInternal(): void {
    this.permissions.Internal = !this.permissions.Internal;
  }

  public checkOrganization(): void {
    this.permissions.Organizational = !this.permissions.Organizational;
  }

  public checkWorker(): void {
    this.permissions.Worker = !this.permissions.Worker;
  }

  public getCustomDataModel: () => any = () => {
    return { fileName: this.form.controls['fileName'].value, description: this.form.controls['description'].value, ...this.form.controls['permissionsControl'].value };
  };

  private fetchUserGuides(): void {
    if (this.showAdminsitratorView) {
      this.userGuidesService
        .geAllUserGuides()
        .takeWhile(() => this.alive && this.showAdminsitratorView)
        .subscribe(userGuides => {
          this.userGuidesHeaders = userGuides;
        });
    } else {
      this.userGuidesService
        .getUserRelatedUserGuides()
        .takeWhile(() => this.alive && !this.showAdminsitratorView)
        .subscribe(userGuides => {
          this.userGuidesHeaders = userGuides;
        });
    }
  }

  private oneOrMoreViewerIsSelected(control: AbstractControl): { [key: string]: any } {
    if (this.permissions.Internal || this.permissions.Organizational || this.permissions.Worker) {
      return null;
    }
    return { error: 'error' };
  }

  private initializePermissions(): {
    Internal: boolean;
    Worker: boolean;
    Organizational: boolean;
  } {
    return { Internal: false, Worker: false, Organizational: false };
  }
}
