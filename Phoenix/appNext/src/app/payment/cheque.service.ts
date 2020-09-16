import { Injectable } from '@angular/core';
import { ApiService, CommonService, LoadingSpinnerService } from '../common/index';
import { Observable } from 'rxjs/Observable';
import { CommandResponse } from '../common/model/index';
declare var oreq: any;

@Injectable()
export class ChequeService {

  constructor(
    private apiService: ApiService,
    private commonService: CommonService,
    private loadingSpinnerService: LoadingSpinnerService,
  ) { }


  public executeCommand(commandName: string, workflowComments: string, payload: any): Promise<CommandResponse> {
    if (workflowComments != null && workflowComments !== '') {
      payload.Comments = workflowComments;
    }

    // show extra spinner to prevent flickering between executing action and query
    this.loadingSpinnerService.show();

    return new Promise((resolve, reject) => {
      this.apiService.command(commandName, payload)
        .then(r => {

          if (!r.IsValid) {
            this.loadingSpinnerService.hideAll();
            reject(r.ValidationMessages);
            return;
          }

          this.loadingSpinnerService.hide();
          resolve(r);
        })
        .catch(ex => {
          this.loadingSpinnerService.hideAll();
          console.error(commandName, payload, ex);
          reject(ex);
        });

    });
  }

  public executeStateCommand(commandName: string, payload: any) {
    return new Promise((resolve, reject) => {
      this.apiService.command(commandName, payload)
        .then((response: CommandResponse) => {
          if (!response.IsValid) {
            reject(response.ValidationMessages);
          } else {
            resolve(response);
          }
        })
        .catch(ex => {
          reject(ex);
        });
    });
  }

  public getAllCheques(oDataParams): Observable<any> {
    oDataParams = oDataParams || oreq.request().withSelect(['Id', 'OrganizationalIdInternal', 'OrganizationalInternalLegalName', 'BankId', 'BankName', 'CurrencyId', 'PaymentStatus', 'Description', 'PaymentStatus', 'EPPChequeBatchId']).url();
    return Observable.fromPromise(this.apiService.query('payment/cheque?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '')));

  }

  getChequeEPPBatch(batchId): Observable<any> {
    return Observable.fromPromise(this.apiService.query(`payment/chequeEPPBatches/${batchId}`));
  }

}
