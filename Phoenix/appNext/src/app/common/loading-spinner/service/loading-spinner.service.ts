import { Injectable, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class LoadingSpinnerService {

  private get isLoading() {
    return this.showCount > 0;
  }

  private showCount = 0;

  loadingChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  progressTextChanged: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor() { }

  public show() {
    this.showCount++;
    if (this.showCount <= 1) {
      // Attention!!! do not delete the next line. it used for debugging reason
      // console.trace();
      this.loadingChanged.next(this.isLoading);
    }
  }

  public setProgressText(text: string) {
    this.progressTextChanged.next(text);
  }

  public hide() {
    this.showCount--;

    if (this.showCount < 0) {
      console.error('Loading Spinner ShowCount < 0', this.showCount);
    }

    if (this.showCount <= 0) {
      this.showCount = 0;
      this.loadingChanged.next(this.isLoading);
      this.progressTextChanged.next('');
    }
  }

  public hideAll() {
    if (this.showCount > 0) {
      this.showCount = 0;
      this.loadingChanged.next(this.isLoading);
      this.progressTextChanged.next('');
    }
  }

}
