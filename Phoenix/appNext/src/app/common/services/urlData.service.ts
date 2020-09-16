import { Injectable, Inject } from '@angular/core';

@Injectable()
export class UrlData {

  constructor(
  ) { }

  returnUrl: string;

  // todo : after refactoring it should be changed to Array<string>
  public setUrl(data: string) {
    this.returnUrl = data;
  }

  public getUrl() {
    return this.returnUrl;
  }

  public clearUrl() {
    this.returnUrl = null;
  }
}
