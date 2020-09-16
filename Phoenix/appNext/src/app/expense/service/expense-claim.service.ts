import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';

import { StateService } from './../../common/state/service/state.service';

import { ExpenseClaim, ExpenseItem, AvailableWorkOrder, ExpenseClaimStatus } from './../model';
import { expenseClaimActions } from './../state/expense-claim/expense-claim.action';
import { CommonService, ApiService, WorkflowService, LoadingSpinnerService, PhxConstants } from '../../common/index';
import { PhxDocument, EntityList, UserProfile } from '../../common/model/index';
import { ConcurrencyError } from './../../common/model/concurrency-error';
import { DocumentService } from '../../common/services/document.service';
import { AuthService } from '../../common/services/auth.service';
import { DatePipe } from '@angular/common';

@Injectable()
export class ExpenseClaimService {
  private expenseClaimPrintPreviewUrl = 'api/report/expenseclaim';
  constructor(
    private apiService: ApiService,
    private state: StateService,
    private workflowService: WorkflowService,
    private commonService: CommonService,
    private documentService: DocumentService,
    private loadingSpinnerService: LoadingSpinnerService,
    private authService: AuthService,
    private datePipe: DatePipe,
  ) {
    this.apiService.OnConcurrencyError.subscribe((data: ConcurrencyError) => {
      this.loadingSpinnerService.hideAll();
      this.getExpenseClaim(data.GroupingEntityId, null, true);
    });
  }

  private param(oDataParams) {
    return oDataParams
      ? `?${oDataParams}`
      : '';
  }

  public getExpenseClaim(id: number, oDataParams = null, forceGet = false): BehaviorSubject<ExpenseClaim> {

    const state = this.state.value;
    const targetValue = state && state.expenseClaim && state.expenseClaim.expenseClaims && state.expenseClaim.expenseClaims[id];

    if (targetValue === null || targetValue === undefined || forceGet) {

      this.apiService.query(`expenseClaim/${id}${this.param(oDataParams)}`)
        .then((response: ExpenseClaim) => {
          this.updateExpenseClaimState(response);
        });
    }

    return this.getExpenseClaimFromState(id);
  }

  public getExpenseClaimFromState(id: number): BehaviorSubject<ExpenseClaim> {
    return this.state.select<ExpenseClaim>(`expenseClaim.expenseClaims.${id}`);
  }

  public getExpenseClaimItems(id: number, oDataParams = null, forceGet = false) {

    const state = this.state.value;
    const targetValue = state &&
      state.expenseClaim &&
      state.expenseClaim.expenseClaims &&
      state.expenseClaim.expenseClaims[id] &&
      state.expenseClaim.expenseClaims[id].ExpenseItems;

    if (targetValue === null || targetValue === undefined || forceGet) {

      this.apiService.query(`expenseClaim/${id}/items`, false)
        .then((response: Array<ExpenseItem>) => {
          this.updateExpenseClaimItemsState(id, response);
        });
    }

    return this.state.select<ExpenseClaim>(`expenseClaim.expenseClaims.${id}`);
  }

  public getCurrentExpenseItemFromState(): BehaviorSubject<ExpenseItem> {
    return this.state.select<ExpenseItem>(`expenseClaim.currentExpenseItem`);
  }

  public getAvailableWorkOrders() {

    this.apiService.query(`expenseClaim/availableWorkOrders`)
      .then(response => {
        this.state.dispatch(expenseClaimActions.expenseClaims.setAvailableWorkOrders, response);
      });

    return this.state.select<Array<AvailableWorkOrder>>(`expenseClaim.availableWorkOrdersList`);
  }

  public getSubdivisionTaxes(subdivisionId: number, date: Date) {
    return new Promise((resolve, reject) => {
      const dateString = this.datePipe.transform(date, 'yyyy-MM-dd');
      this.apiService.query(`SalesTaxVersionRate/getSalesTaxVersionRatesBySubdivisionAndDate/subdivision/${subdivisionId}/date/${dateString}`)
        .then((res: any) => {
          resolve(res.Items);
        })
        .catch((err) => reject(err));
    });
  }

  public getExpenseClaimDocumentByPublicId(expenseClaimId: number, publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.documentService.getDocumentById(publicId)
        .then((documentReponse: PhxDocument) => {
          resolve(documentReponse);
        })
        .catch((err) => reject(err));
    });
  }

  public getExpenseClaimDocumentById(expenseClaimId: number, forceGet: boolean = false) {
    const expenseClaimEntityType = PhxConstants.EntityType.ExpenseClaim;

    const state = this.state.value;
    const targetValue = state && state.expenseClaim.documentList && state.expenseClaim.documentList[expenseClaimId];

    if (targetValue === null || targetValue === undefined || forceGet) {

      this.documentService.getEntityDocuments(expenseClaimEntityType, expenseClaimId)
        .then((documentReponse: EntityList<PhxDocument>) => {
          this.state.dispatch(expenseClaimActions.documentList.load,
            {
              Id: expenseClaimId,
              Items: documentReponse.Items
            });
        });
    }
  }

  public getExpenseClaimDocumentByIdFromState(expenseClaimId: number): BehaviorSubject<Array<PhxDocument>> {
    return this.state.select<Array<PhxDocument>>(`expenseClaim.documentList.${expenseClaimId}`);
  }

  public create(workOrderId: number) {
    const payload = { WorkOrderId: workOrderId };
    return new Promise((resolve, reject) => {
      this.apiService.command('NewExpenseClaim', payload)
        .then(r => {
          if (!r.IsValid) {
            this.loadingSpinnerService.hideAll();
            reject(r.ValidationMessages);
            return;
          }
          resolve(r.EntityId);
        })
        .catch(ex => {
          this.loadingSpinnerService.hideAll();
          console.error('NewExpenseClaim', payload, ex);
          reject(ex);
        });

    });
  }

  public executeExpenseCommand(commandName: string, workflowComments: string, payload: any, oDataParams = null) {
    if (workflowComments != null && workflowComments !== '') {
      payload.Comments = workflowComments;
    }

    // show extra spinner to prevent flickering between executing action and query
    this.loadingSpinnerService.show();

    return new Promise((resolve, reject) => {
      this.apiService.command(commandName, payload)
        .then(r => { // signalr notification response
          if (!r.IsValid) {
            this.loadingSpinnerService.hideAll();
            reject(r.ValidationMessages);
            return;
          }

          const query = `expenseClaim/${r.EntityId}${this.param(oDataParams)}`;
          this.apiService.query(query)
            .then((response: ExpenseClaim) => {
              this.updateExpenseClaimState(response);
              this.loadingSpinnerService.hide();
              resolve(payload.EntityIds[0]);
            })
            .catch(ex => {
              console.error(query, ex);
              this.loadingSpinnerService.hideAll();
              reject(ex);
            });
        })
        .catch(ex => {
          this.loadingSpinnerService.hideAll();
          console.error(commandName, payload, ex);
          reject(ex);
        });

    });
  }

  public executePartialSaveCommand(id: number, workOrderId: number, column: string, val: any) {
    const commandName = 'SaveExpenseClaim';

    const payload = {
      Id: id,
      WorkOrderId: workOrderId,
      PartialSaveColumns: []
    };
    payload[column] = val;
    payload.PartialSaveColumns.push(column);

    return new Promise((resolve, reject) => {
      this.apiService.command(commandName, payload, false)
        .then(r => {

          if (!r.IsValid) {
            reject(r.ValidationMessages);
            return;
          }

          resolve();

        })
        .catch(ex => {
          console.error(commandName, payload, ex);
          reject(ex);
        });

    });
  }

  public deleteExpenseItemAttachment(id: number, publicId: string): Promise<any> {
    const commandName = 'DeleteExpenseItemAttachment';
    const payload = {
      Id: id,
      PublicId: publicId
    };

    return new Promise((resolve, reject) => {
      this.apiService.command(commandName, payload, true)
        .then(r => {

          if (!r.IsValid) {
            reject(r.ValidationMessages);
            return;
          }

          resolve();

        })
        .catch(ex => {
          console.error(commandName, payload, ex);
          reject(ex);
        });

    });

  }

  public deleteExpenseItem(id: number, lastModifiedDatetime) {
    const commandName = 'DiscardExpenseItem';
    const payload = {
      Id: id,
      LastModifiedDatetime: lastModifiedDatetime
    };

    return new Promise((resolve, reject) => {
      this.apiService.command(commandName, payload, true)
        .then(r => {

          if (!r.IsValid) {
            reject(r.ValidationMessages);
            return;
          }

          resolve();

        })
        .catch(ex => {
          console.error(commandName, payload, ex);
          reject(ex);
        });

    });
  }

  public saveExpenseItem(expenseItem: ExpenseItem): Promise<ExpenseItem> {
    // show extra spinner to prevent flickering between executing action and query
    this.loadingSpinnerService.show();

    let commandName = 'SaveExpenseItem';
    if (!expenseItem.Id || expenseItem.Id === 0) {
      commandName = 'NewExpenseItem';
    }

    return new Promise((resolve, reject) => {
      this.apiService.command(commandName, expenseItem, false)
        .then(r => {
          if (!r.IsValid) {
            this.loadingSpinnerService.hideAll();
            reject(r.ValidationMessages);
            return;
          }

          this.apiService.query(`expenseItem/${r.EntityId}`).then((response: any) => {
            this.updateExpenseItemState(response);
            this.loadingSpinnerService.hide();
            resolve(response);
          }).catch(ex => {
            this.loadingSpinnerService.hideAll();
            console.error(`expenseItem/${r.EntityId}`, ex);
            reject(ex);
          });

        })
        .catch(ex => {
          this.loadingSpinnerService.hideAll();
          console.error(commandName, expenseItem, ex);
          reject(ex);
        });

    });
  }

  public deleteDocument(expenseClaimId: number, publicId: string) {
    const commandName = 'ExpenseClaimRemoveDocumentState';
    const payload = {
      EntityIds: [expenseClaimId],
      EntityTypeId: this.commonService.ApplicationConstants.EntityType.ExpenseClaim,
      PublicId: publicId,
      IncludeChildren: true
    };
    return this.executeExpenseCommand(commandName, null, payload, null).then(() => {
      this.state.dispatch(expenseClaimActions.documentList.remove,
        {
          expenseClaimId: expenseClaimId,
          publicId: publicId
        });
    });
  }

  public updateExpenseClaimState(expenseClaim: ExpenseClaim) {
    this.state.dispatch(expenseClaimActions.expenseClaims.updateState, expenseClaim);
  }

  public updateExpenseClaimItemsState(expenseClaimId: number, expenseClaimItems: Array<ExpenseItem>) {
    this.state.dispatch(expenseClaimActions.expenseClaims.updateItemsState, {
      expenseClaimId,
      expenseClaimItems
    });
  }

  public updateExpenseItemState(expenseItem: ExpenseItem) {
    this.state.dispatch(expenseClaimActions.expenseItems.updateState, {
      expenseClaimId: expenseItem.ExpenseClaimId,
      expenseItem: expenseItem
    });
  }

  public updateCurrentExpenseItemState(expenseItem: ExpenseItem) {
    this.state.dispatch(expenseClaimActions.expenseItems.updateCurrentItemState, expenseItem);
  }

  public removeExpenseItemFromState(expenseItem: ExpenseItem) {
    this.state.dispatch(expenseClaimActions.expenseItems.removeFromState, {
      expenseClaimId: expenseItem.ExpenseClaimId,
      expenseItem: expenseItem
    });
  }

  public addDocumentToState(expenseClaimId: number, document: PhxDocument) {
    this.state.dispatch(expenseClaimActions.documentList.add,
      {
        expenseClaimId: expenseClaimId,
        document: document
      });
  }

  public clearItemsValidationErrors(expenseClaimId: number) {
    this.state.dispatch(expenseClaimActions.expenseItems.clearValidationErrors,
      {
        expenseClaimId: expenseClaimId,
      });
  }

  public setItemsValidationErrors(expenseClaimId: number, itemId: number, validationErrors: string[]) {
    this.state.dispatch(expenseClaimActions.expenseItems.setValidationErrors,
      {
        expenseClaimId: expenseClaimId,
        itemId: itemId,
        validationErrors: validationErrors
      });
  }

  public addItemsValidationErrors(expenseClaimId: number, itemId: number, validationErrors: string[]) {
    this.state.dispatch(expenseClaimActions.expenseItems.addValidationErrors,
      {
        expenseClaimId: expenseClaimId,
        itemId: itemId,
        validationErrors: validationErrors
      });
  }

  public isEditable(expenseClaim: ExpenseClaim): Observable<boolean> {
    if (!expenseClaim || !expenseClaim.AvailableStateActions) {
      return Observable.of(false);
    } else {
      const result = expenseClaim.AvailableStateActions.some((id: number) => id === PhxConstants.StateAction.ExpenseClaimSaveState);
      return Observable.of(result);
    }
  }

  public printExpenseClaim(expenseClaim: ExpenseClaim) {
    const timezoneOffset = (new Date()).getTimezoneOffset();
    const url = `${this.commonService.api2Url}${this.expenseClaimPrintPreviewUrl}/${expenseClaim.Id}/${timezoneOffset}/true/?access_token=${this.commonService.bearerToken()}`;
    window.open(url + '&attachment=true', '_parent');
  }
}
