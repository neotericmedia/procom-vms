import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgReduxModule, select, NgRedux } from '@angular-redux/store';
import { StateService } from './service/state.service';
import { StateDirective } from './directive/state.directive';
// fix me
import { NgReduxRouterModule } from './router';
// import { NgReduxRouterModule, NgReduxRouter } from '@angular-redux/router';

@NgModule({
  imports: [CommonModule, NgReduxModule, NgReduxRouterModule],
  declarations: [StateDirective],
  exports: [StateDirective],
  providers: [StateService]
})
export class StateModule {
  constructor(@Optional() @SkipSelf() parentModule: StateModule) {
    if (parentModule) {
      throw new Error('StateModule is already loaded. Import it in the AppModule only');
    }
  }
}

export { StateService, select };
export { compose } from './function/compose';
