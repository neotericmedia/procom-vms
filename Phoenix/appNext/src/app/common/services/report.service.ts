import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from './api.service';
import { CommonService } from './common.service';

@Injectable()
export class ReportService {
  endpoint: string = 'api/report';

  constructor(
    private apiService: ApiService,
    private commonService: CommonService,
    private sanitizer: DomSanitizer,
  ) { }

  public createLink(urlParams: string): string {
    return `${this.commonService.api2Url}${this.endpoint}/${urlParams}?access_token=${this.commonService.bearerToken()}`;
  }

  public createSanitizedLink(urlParams: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.createLink(urlParams));
  }
}
