import { ApiService } from './../../common/services/api.service';
import { Observable } from 'rxjs/Observable';
import { Injectable, Inject } from '@angular/core';

@Injectable()
export class AccessSubscriptionService {
    serviceId = 'AccessSubscriptionApiService';

    constructor(
        private apiService: ApiService
    ) {
        // fix me
        //$common.setControllerName(this.serviceId);
    }

    //  Commands
    accessSubscriptionNew(command: any) {
        return (this.apiService.command('AccessSubscriptionNew', command));
    }
    // appNext\src\app\contact\contact-subscriptions\contact-subscriptions.component.ts

}
