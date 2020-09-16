import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/operators/tap';
import { EventService } from './event.service';
import { CommonService } from './common.service';

@Injectable()
export class ApiHttpInterceptorService implements HttpInterceptor {
  constructor(private eventService: EventService, private commonService: CommonService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).do(null, response => {
      if (response instanceof HttpResponse) {
        const status = response.status,
          config = response.body.config,
          interceptorOptions = config ? config.interceptorOptions : null,
          skipErrorIntercept = interceptorOptions ? interceptorOptions.skipErrorIntercept : false;

        if (skipErrorIntercept) {
          // return response;
          // return $q.reject(response);
          return;
        } else if (status === 400) {
          // Handle validation errors collection
          console.log('intercepting 400');
          console.log('http intercept:' + response);
          console.log('http intercept:' + response.body.data.ErrorList);

          this.eventService.trigger('event:brokenRules', response.body.BrokenRules);

          // return response;
          // return $q.reject(response);
          return;
        } else if (status === 500) {
          // Handle server errors collection
          if (response.body && response.body.ExceptionMessage !== undefined) {
            this.commonService.logError(response.body.ExceptionMessage, true);
          } else if (response.body.Message !== undefined) {
            // logError(response.data.Message, true);
            // TODO: put localized message
            const message = response.body.Message.indexOf('Security Exception') === 0 ? response.body.Message : 'Server Error';
            this.commonService.logError(message, true);
          } else if (response.body.ErrorList !== undefined) {
            (<Array<any>>response.body.ErrorList).forEach(err => {
              this.commonService.logError(err, true);
            });
          }
          // return $q.reject(response);
          return;
        } else if (status === 403) {
          this.eventService.trigger('event:forbidden', { Message: response.body.Message, ErrorList: response.body.ErrorList });
          this.commonService.logError(response.body.Message, true);
          // return $q.reject(response);
          return;
        }
        // otherwise
        // return $q.reject(response);
        return;
      }
    });
  }
}
