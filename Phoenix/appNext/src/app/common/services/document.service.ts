import { CommandResponse } from './../model/command-response';
import { ApiService } from './api.service';
import { EntityList } from './../model/entity-list';
import { Injectable, Inject } from '@angular/core';
import { PhxDocument } from './../model/phx-document';
import { PhxConstants } from '../PhoenixCommon.module';
import { CommonService } from './common.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { resolve } from 'url';
import { Observable } from 'rxjs/Rx';

declare var oreq: any;

@Injectable()
export class DocumentService {

  constructor(
    private apiService: ApiService,
    private commonService: CommonService,
    private sanitizer: DomSanitizer,
  ) { }

  public getEntityDocumentsList(entityTypeId: number, entityId: number, tableState, oDataParams): Observable<any> {
    const tableStateParams = tableState && tableState !== undefined ? this.generateRequestObject(tableState).url() : '';
    return Observable.fromPromise(this.apiService.query(`document/${entityTypeId}/${entityId}?` + (oDataParams && oDataParams !== undefined ? oDataParams + '&' : '') + tableStateParams));
  }

  generateRequestObject(tableState) {
    const searchObj = tableState && tableState.search && tableState.search.predicateObject ? tableState.search.predicateObject : null;
    const sortObj = tableState && tableState.sort && tableState.sort.predicate ? tableState.sort.predicate + (tableState.sort.reverse ? ' desc ' : '') : null;
    let currentPage = tableState && tableState.pagination && tableState.pagination.currentPage ? tableState.pagination.currentPage : 1;
    const pageSize = tableState && tableState.pagination && tableState.pagination.pageSize ? tableState.pagination.pageSize : 30;
    const isDisabled = tableState && tableState.pagination && tableState.pagination.isDisabled ? tableState.pagination.isDisabled : null;
    currentPage--;
    let oDataParams = oreq.request();
    if (Object.keys(searchObj).length > 0) {
      oDataParams = oDataParams.withFilter(oreq.filter().smartTableObjectConverter(searchObj));
    }
    if (sortObj) {
      oDataParams = oDataParams.withOrderby(sortObj);
    }
    if (!(tableState && tableState.pagination && tableState.pagination.isDisabled === true)) {
      oDataParams = oDataParams
        .withTop(pageSize)
        .withSkip(currentPage * pageSize)
        .withInlineCount();
    } else {
      oDataParams = oDataParams.withInlineCount();
    }
    return oDataParams;
  }

  // publicId is Guid
  public getDocumentById(publicId: string): Promise<PhxDocument> {
    return this.apiService.query(`document/${publicId}`);
  }

  public getEntityDocuments(entityTypeId: number, entityId: number): Promise<EntityList<PhxDocument>> {
    return this.apiService.query(`document/${entityTypeId}/${entityId}`);
  }

  public getPdfStreamByPublicId(publicId) {
    return this.apiService.url('document/' + publicId + '/getPdfStreamByPublicId');
  }

  public getCsvStreamByPublicId(publicId) {
    return this.apiService.url('document/' + publicId + '/getCsvStreamByPublicId');
  }

  public getEntityDocumentsByDocumentTypeId(entityTypeId: number, entityId: number, documentTypeId: PhxConstants.DocumentType, showLoader: boolean = true): Promise<EntityList<PhxDocument>> {
    return this.apiService.query(`document/${entityTypeId}/${entityId}/${documentTypeId}`, showLoader);
  }

  public deleteDocumentByPublicId(publicId: string): Promise<CommandResponse> {
    return this.apiService.command('RemoveDocument',
      {
        PublicId: publicId,
        IncludeChildren: true,
        WorkflowPendingTaskId: -1
      });
  }

  public createPdfDocumentLink(publicId: string, fileName?: string): string {
    const docEndpoint: string = 'api/document';
    const docAction: string = 'getPdfStreamByPublicId';
    // fileName will set the title on Iframe, while loading documents
    if (!fileName) {
      return `${this.commonService.api2Url}${docEndpoint}/${publicId}/${docAction}?access_token=${this.commonService.bearerToken()}`;
    } else {
      return `${this.commonService.api2Url}${docEndpoint}/${publicId}/${docAction}/${fileName}?access_token=${this.commonService.bearerToken()}`;
    }

  }

  public createDocumentLink(publicId: string): string {
    const docEndpoint: string = 'api/document';
    const docAction: string = 'getStreamByPublicId';
    return `${this.commonService.api2Url}${docEndpoint}/${publicId}/${docAction}?access_token=${this.commonService.bearerToken()}`;
  }

  public createThumbnailDocumentLink(publicId: string, width: number = 110, height: number = 110): string {
    const docEndpoint: string = 'api/document';
    const docAction: string = 'thumbnail';
    return `${this.commonService.api2Url}${docEndpoint}/${publicId}/${docAction}?width=${width}&height=${height}&access_token=${this.commonService.bearerToken()}`;
  }

  public createSanitizedPdfDocumentLink(publicId: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.createDocumentLink(publicId));
  }

  public createSanitizedDocumentLink(publicId: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.createDocumentLink(publicId));
  }

  public createSanitizedThumbnailDocumentLink(publicId: string, width: number = 110, height: number = 110): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.createThumbnailDocumentLink(publicId, width, height));
  }

  public getProfilePicture(profileId: number): Promise<string> {
    const imageUrl = this.apiService.query(`UserProfile/GetContactId/${profileId}`, false)
      .then((contactId: number) => {
        return this.getEntityDocumentsByDocumentTypeId(this.commonService.ApplicationConstants.EntityType.Contact, contactId, this.commonService.ApplicationConstants.DocumentType.Profile, false);
      })
      .then((docList: EntityList<PhxDocument>) => {
        if (docList.Items.length !== 0) {
          const publicId = docList.Items[0].PublicId;
          return this.createThumbnailDocumentLink(publicId, 120, 120);
        } else {
          return Promise.resolve(null);
        }
      });
    return imageUrl;
  }

}
