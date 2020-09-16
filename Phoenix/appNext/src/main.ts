import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import 'hammerjs';

declare function require(name: string);

(<any>window).api2Url = environment.apiUrl;
(<any>window).rollbarConfig = environment.rollbar;

(<any>window).$ = require('../node_modules/jquery/dist/jquery.min.js');
(<any>window).jQuery = (<any>window).$;
(<any>window).moment = require('../node_modules/moment/moment.js');
(<any>window).toastr = require('../node_modules/toastr/build/toastr.min.js');
(<any>window).oreq = require('../node_modules/oreq/src/oreq.js');
(<any>window).hubConnection = require('../node_modules/signalr/jquery.signalR.js');

require('../vendor/oreq.smartTableAdapter.js');
// require('../vendor/jquery.dataTables.customOrder.js');
// require('../vendor/FileSaver.js');

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
