import { WorkflowService } from './../../common/services/workflow.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService, PhxConstants } from '../../common/index';
import { SalesTaxVersion } from '../model';

@Injectable()
export class SalesTaxService {
  constructor(private apiService: ApiService, private workflowService: WorkflowService) {}

  public getSelectedSalesTax(versionId: number) {
    return Observable.fromPromise(this.apiService.query('payroll/getSalesTaxHeaderByVersionId/taxHeaderVersion/' + versionId));
  }

  public getAvailableStateActions(VersionId: number) {
      return Observable.fromPromise(this.workflowService.getAvailableStateActions(PhxConstants.EntityType.SalesTaxVersion, VersionId));
  }

  public executeWorkflowAction(commandName: string, version: SalesTaxVersion) {
    const command = {
      EntityIds: [version.Id],
      SalesTaxVersion: version
    };
    return Observable.fromPromise(this.apiService.command(commandName, command));
  }
}
