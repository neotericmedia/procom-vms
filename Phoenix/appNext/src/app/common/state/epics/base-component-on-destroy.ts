import { OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/Subject';

export abstract class BaseComponentOnDestroy implements OnDestroy {
  public isDestroyed$ = new Subject<boolean>();
  @Output() outputEvent = new EventEmitter();

  constructor() {
    const f = this.ngOnDestroy.bind(this);
    this.ngOnDestroy = () => {
      this.isDestroyed$.next(true);
      this.isDestroyed$.complete();
      f();
    };
  }

  ngOnDestroy(): void {}
}
