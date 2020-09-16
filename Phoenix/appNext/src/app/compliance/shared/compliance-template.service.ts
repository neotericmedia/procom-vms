import { Injectable } from '@angular/core';
import { ApiService, LoadingSpinnerService } from '../../common/index';
import { StateService } from '../../common/state/state.module';
import { ComplianceTemplateStatePath, complianceTemplateActions } from '../state/index';
import { CommandResponse } from '../../common/model/index';
import { ComplianceTemplate } from './index';

@Injectable()
export class ComplianceTemplateService {
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
    return `ComplianceTemplate/${id}${this.param(oDataParams)}`;
  }

  public getTemplateById(id: number, oDataParams = null, forceGet = false) {
    const state = this.state.value;
    const targetValue = state && state.complianceTemplate && state.complianceTemplate.complianceTemplates && state.complianceTemplate.complianceTemplates[id];

    if (targetValue === null || targetValue === undefined || forceGet) {

      this.apiService.query(this.getByIdUrl(id, oDataParams))
        .then((response: ComplianceTemplate) => {
          this.updateState(response);
        });
    }

    return this.state.select<ComplianceTemplate>(ComplianceTemplateStatePath.complianceTemplate.complianceTemplates.byId(id).instance);
  }

  public getTemplateByIdFromApi(id: number, oDataParams = null): Promise<ComplianceTemplate> {
    return new Promise((resolve, reject) => {
      this.apiService.query(this.getByIdUrl(id, oDataParams))
        .then((response: ComplianceTemplate) => {
          resolve(response);
        })
        .catch((error) => { reject(error); });
    });
  }


  public executeCommand(commandName: string, payload?: ComplianceTemplate, oDataParams = null, updateState: boolean = true) {

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
            .then((response: ComplianceTemplate) => {
              if (updateState === true) {
                this.updateState(response);
              }
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

  public getTemplateEditMode(id: number) {
    const state = this.state.value;

    return this.state.select<boolean>(ComplianceTemplateStatePath.complianceTemplate.uiState.byId(id).editable.instance);
  }


  public updateState(template: ComplianceTemplate) {
    this.state.dispatch(complianceTemplateActions.complianceTemplate.updateState, template);
  }

  public updateUiStateEditable(id: number, editable: boolean) {
    this.state.dispatch(complianceTemplateActions.uiState.setEditMode,
      {
        id: id,
        editable: editable
      });
  }
}
