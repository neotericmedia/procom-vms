import { Injectable } from '@angular/core';
import { ApiService, LoadingSpinnerService } from '../../common/index';
import { StateService } from '../../common/state/state.module';
import { DocumentTypeStatePath, documentTypeActions } from '../state/index';
import { DocumentType } from '../shared/index';
import { CommandResponse } from '../../common/model/index';

@Injectable()
export class DocumentTypeService {

  constructor(
    private apiService: ApiService,
    private state: StateService,
    private loadingSpinnerService: LoadingSpinnerService,
  ) { }

  private param(oDataParams) {
    return oDataParams
      ? `?${oDataParams}`
      : '';
  }

  private getByIdUrl(id: number, oDataParams = null): string {
    return `ComplianceDocumentType/${id}${this.param(oDataParams)}`;
  }

  public getDocumentType(id: number, oDataParams = null, forceGet = false) {
    const state = this.state.value;
    const targetValue = state && state.documentType && state.documentType.documentTypes && state.documentType.documentTypes[id];

    if (targetValue === null || targetValue === undefined || forceGet) {

      this.apiService.query(this.getByIdUrl(id, oDataParams))
        .then((response: DocumentType) => {
          this.updateState(response);
        });
    }

    return this.state.select<DocumentType>(DocumentTypeStatePath.documentType.documentTypes.byId(id).instance);
  }


  public executeCommand(commandName: string, payload?: DocumentType, oDataParams = null) {

    // show extra spinner to prevent flickering between executing action and query
    this.loadingSpinnerService.show();

    return new Promise((resolve, reject) => {
      this.apiService.command(commandName, payload)
        .then((r: CommandResponse) => {

          if (!r.IsValid) {
            this.loadingSpinnerService.hideAll();
            reject(r.ValidationMessages);
            return;
          }

          const url = this.getByIdUrl(r.EntityId, oDataParams);
          this.apiService.query(url)
            .then((response: DocumentType) => {
              this.updateState(response);
              this.loadingSpinnerService.hide();
              resolve(r.EntityId);
            })
            .catch(ex => {
              console.error(url, ex);
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

  public getDocumentTypeEditMode(id: number) {
    const state = this.state.value;

    return this.state.select<boolean>(DocumentTypeStatePath.documentType.uiState.byId(id).editable.instance);
  }

  public updateState(documentType: DocumentType) {
    this.state.dispatch(documentTypeActions.documentType.updateState, documentType);
  }

  public updateUiStateEditable(id: number, editable: boolean) {
    this.state.dispatch(documentTypeActions.uiState.setEditMode,
      {
        id: id,
        editable: editable
      });
  }
}
