import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ApiService } from './../../common/services/api.service';
import { ReportLogItem } from '../model/report-log';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ReportRoutingConfiguration } from '../model/report-list';
import { PhxDataTableUserProfile } from '../../common/model/index';

@Injectable()
export class ReportService {
  private reportRoutingConfig = new BehaviorSubject<Array<ReportRoutingConfiguration>>(null);
  private reportUserViewStates = new BehaviorSubject<PhxDataTableUserProfile>(null);

  constructor(
    private apiService: ApiService
  ) { }

  public reportRoutingConfig$(): Observable<Array<ReportRoutingConfiguration>> {
    return this.reportRoutingConfig.asObservable();
  }
  public changeRoutingCongfig(data: Array<ReportRoutingConfiguration>) {
    this.reportRoutingConfig.next(data);
  }

  public reportUserViewStates$(): Observable<PhxDataTableUserProfile> {
    return this.reportUserViewStates.asObservable();
  }
  public changeUserViewStates(data: PhxDataTableUserProfile) {
    this.reportUserViewStates.next(data);
  }

  public getReportList(): Observable<any> {
    return Observable.fromPromise(this.apiService.query('report/getReportList'));
  }

  public getReportCols(reportId: number) {
    return this.apiService.query('report/getReportConfiguration/' + reportId);
  }

  public getReportDetails(reportName: string, cols: string[]) {
    let selectCols = [];
    selectCols = selectCols.concat(cols);
    const apiUrl = oreq.request(`reportData/getReport${reportName}Data`)
      .withSelect(selectCols).url();
    return Observable.fromPromise(this.apiService.query(apiUrl));
  }

  public logReportExport(reportLogItem: ReportLogItem): Promise<any> {
    return this.apiService.command('ReportExportLog', reportLogItem);
  }
}
