import { DialogResultType } from './../model/dialog-result-type';
import { DialogService } from './../services/dialog.service';
import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { PhxLocalizationService } from '..';

export interface ComponentCanDeactivate {
  canDeactivate: () => boolean;
}

@Injectable()
export class PendingChangesGuard implements CanDeactivate<ComponentCanDeactivate> {
  constructor(
    private dialogService: DialogService,
    private localizationService: PhxLocalizationService,
  ) {}

  canDeactivate(component: ComponentCanDeactivate): Observable<boolean> | Promise<boolean> | boolean {
    // https://stackoverflow.com/a/41187919
    // if there are no pending changes, just allow deactivation; else confirm first
    return component.canDeactivate() ?
      true :
      // NOTE: this warning message will only be shown when navigating elsewhere within your angular app;
      // when navigating away from your angular app, the browser will show a generic warning message
      // see http://stackoverflow.com/a/42207299/7307355
      this.confirm()
      ;
  }

  confirm(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.dialogService.confirm(
        this.localizationService.translate('common.generic.confirm'),
        'You have unsaved changes. Do you want to discard these changes?'
      )
      .then((result: DialogResultType) => {
        resolve(result === DialogResultType.Yes);
      })
      .catch(error => reject(error));
    });
  }
}
