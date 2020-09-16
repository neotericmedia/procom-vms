import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../../common/index';
import { StateService } from '../../common/state/state.module';
import { Demo } from './index';
import { demoActions, DemoStatePath } from '../state/index';

@Injectable()
export class DemoService {

  constructor(
    private apiService: ApiService,
    private state: StateService,
  ) { }

  private param(oDataParams) {
    return oDataParams
      ? `?${oDataParams}`
      : '';
  }

  private getByIdUrl(id: number, oDataParams = null): string {
    return `demo/${id}${this.param(oDataParams)}`;
  }

  // Method 2

  public getDemo(id: number, oDataParams = null, forceGet = false) {

    const state = this.state.value;
    const targetValue = state && state.demo && state.demo.demos && state.demo.demos[id];

    if (targetValue === null || targetValue === undefined || forceGet) {

      this.apiService.query(this.getByIdUrl(id, oDataParams))
        .then((response: Demo) => {
          this.updateState(response);
        });
    }

    return this.state.select<Demo>(DemoStatePath.demo.demos.byId(id).instance);
  }

  // Method 1

  public getDemoFromApi(id: number, oDataParams = null, forceGet = false) {

    this.apiService.query(this.getByIdUrl(id, oDataParams))
      .then((response: Demo) => {
        this.updateState(response);
      });

  }

  public getDemoFromState(id: number) {

    return this.state.select<Demo>(DemoStatePath.demo.demos.byId(id).instance);

  }

  public updateState(demo: Demo) {
    this.state.dispatch(demoActions.demos.updateState, demo);
  }

  public isDuplicate(value: string): Observable<boolean> {
    return new Observable((observer) => {
      if (value.toLowerCase() === 'duplicate') {
        observer.next(true);
      } else {
        observer.next(false);
      }
      observer.complete();
    });
  }

}
