import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService, CodeValueService, CommonService, DialogService, PhxLocalizationService, CustomFieldService } from '../common';
import { EntityList, PhxDocumentFileUploadConfiguration, PhxConstants, CommandResponse, DialogResultType, CodeValue } from '../common/model';
import { DocumentService } from '../common/services/document.service';
import { SafeResourceUrl } from '@angular/platform-browser';
import { UserGuideFile } from './model/user-guide-file';
import { UserGuideHeader } from './model/user-guide-header';
import { AuthService } from '../common/services/auth.service';

@Injectable()
export class UserGuidesService {
  constructor(
    private apiService: ApiService,
    private commonService: CommonService,
    private authService: AuthService,
    private codeValueService: CodeValueService,
    private documentService: DocumentService,
    private dialogService: DialogService,
    private localizationService: PhxLocalizationService
  ) {}

  public getUserRelatedUserGuides(oDataParams: any = null, showLoader: boolean = true): Observable<UserGuideHeader[]> {
    return Observable.create(observer => {
      this.apiService.query(`UserGuides/getUserRelatedUserGuidesGroupedByParent${this.param(oDataParams)}`, showLoader).then((result: EntityList<UserGuideHeader>) => {
        result.Items.map(userGuidesHeader => {
          const codeUserGuideHeader = this.codeValueService.getCodeValue(userGuidesHeader.UserGuidesHeaderId, 'app.CodeUserGuideHeader');
          return this.mapToUserGuideHeader(userGuidesHeader, codeUserGuideHeader);
        });
        observer.next(result.Items);
        observer.complete();
      });
    });
  }

  public geAllUserGuides(oDataParams: any = null, showLoader: boolean = true): Observable<UserGuideHeader[]> {
    return Observable.create(observer => {
      this.apiService.query(`UserGuides/getAllUserGuidesGroupedByParent${this.param(oDataParams)}`, showLoader).then((result: EntityList<UserGuideHeader>) => {
        const headers = this.codeValueService.getCodeValues('app.CodeUserGuideHeader', true);
        const items = headers.map(header => {
          const userGuidesHeader = result.Items.find(userGuideHeader => userGuideHeader.UserGuidesHeaderId === header.id) || ({ UserGuidesHeaderId: header.id } as UserGuideHeader);
          return this.mapToUserGuideHeader(userGuidesHeader, header);
        });
        observer.next(items);
        observer.complete();
      });
    });
  }

  public isEditButtonShown(): boolean {
    return this.authService.hasFunctionalOperation(this.commonService.ApplicationConstants.FunctionalOperation.UserGuideEdit);
  }

  public createSanitizedPdfDocumentLink(publicId: string): SafeResourceUrl {
    return this.documentService.createSanitizedPdfDocumentLink(publicId);
  }

  public createConfirmDeleteDialog(): Promise<DialogResultType> {
    const message = {
      title: this.localizationService.translate('common.generic.confirm'),
      body: this.localizationService.translate('userGuide.messages.deleteUserGuideFile')
    };

    return this.dialogService.confirm(message.title, message.body);
  }

  public deleteFile(fileToDelete: { Id: number; LastModifiedDatetime: Date }): Promise<CommandResponse> {
    return this.apiService.command('DeleteUserGuide', fileToDelete);
  }

  public viewerNotSelectedError() {
    return this.localizationService.translate('userGuide.messages.viewerNotSelectedError');
  }

  public getDocumentUploadConfiguration(): PhxDocumentFileUploadConfiguration {
    return new PhxDocumentFileUploadConfiguration({
      UploadTitle: this.localizationService.translate('userGuide.labels.uploadUserGuideTitle'),
      WorkflowPendingTaskId: -1,
      entityTypeId: PhxConstants.EntityType.UserGuide,
      entityId: 0,
      customId1: 0,
      customId2: 0,
      customMethodata: null,
      description: '',
      documentTypeId: PhxConstants.DocumentType.UserGuideDocument
    });
  }

  public createPermissionLabelForFile(userGuidesFile: UserGuideFile): string {
    const permissions = [];
    if (userGuidesFile.Internal) {
      permissions.push('internalLabel');
    }
    if (userGuidesFile.Worker) {
      permissions.push('workerLabel');
    }
    if (userGuidesFile.Organizational) {
      permissions.push('organizationalLabel');
    }
    const finalArray = permissions.map(label => this.localizationService.translate(`userGuide.labels.${label}`));
    return finalArray.join(', ');
  }

  private param(oDataParams) {
    return oDataParams ? `?${oDataParams}` : '';
  }

  private mapToUserGuideHeader(userGuidesHeader: UserGuideHeader, header: CodeValue): UserGuideHeader {
    userGuidesHeader.UserGuidesHeaderText = header.text;
    userGuidesHeader.UserGuidesHeaderDescription = header.description;
    userGuidesHeader.UserGuidesHeaderIcon = header.Icon;
    return userGuidesHeader;
  }
}
