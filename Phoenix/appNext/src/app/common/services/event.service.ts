import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class EventService implements OnDestroy {
  ngOnDestroy(): void {
    this.defaultTakeUntil.next();
    this.defaultTakeUntil.complete();
    this.subjects = null;
  }
  private subjects: { [eventName: string]: Subject<any> };
  constructor() {
    this.subjects = {};
  }
  private defaultTakeUntil: Subject<any> = new Subject();

  subscribe(eventName: string, handler: (payload?: any) => void, takeUntil?: Observable<any>): Subscription {
    const fnName = this.createName(eventName);
    if (!this.subjects[fnName]) {
      this.subjects[fnName] = new Subject();
    }
    return this.subjects[fnName]
      .asObservable()
      .takeUntil(takeUntil ? takeUntil.merge(this.defaultTakeUntil) : this.defaultTakeUntil)
      .subscribe(handler);
  }

  trigger(eventName: string, payload?: any): void {
    const fnName = this.createName(eventName);
    if (!this.subjects[fnName]) {
      this.subjects[fnName] = new Subject();
    }
    this.subjects[fnName].next(payload);
  }

  private createName(name: string): string {
    return `$ ${name}`;
  }
}
