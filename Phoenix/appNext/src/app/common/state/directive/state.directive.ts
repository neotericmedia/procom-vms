import { Directive, TemplateRef, ViewContainerRef, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/subscription';
import { StateService } from '../service/state.service';

/* tslint:disable:directive-selector */
@Directive({
  selector: '[state]'
})
export class StateDirective implements OnDestroy {

  private path: string;
  @Input() set state(path: string) {

    // clear existing subscription
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // create new state subscription
    this.path = path;
    this.subscription = this.stateService
      .select(path)
      .subscribe(val => this.refresh(val));

  }

  private subscription: Subscription;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private stateService: StateService) { }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  refresh(val){
    this.viewContainer.clear();
    this.viewContainer.createEmbeddedView(this.templateRef, { $implicit: val });
  }

}