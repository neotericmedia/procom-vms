import { Injectable, Inject } from '@angular/core';
import { ApiService } from './api.service';

@Injectable()
export class DataChangeTrackerApiService {

    constructor(
        private apiSvc: ApiService
    ) { }
    getTrackDataChange(entityTypeId, entityId) {
        return this.apiSvc.query('dataChangeTracker/getTrackDataChange/' + entityTypeId + '/' + entityId);
    }
    getTrackFieldChangeBySource(entityTypeId, entityId) {
        return this.apiSvc.query('dataChangeTracker/getTrackFieldChangeBySource/' + entityTypeId + '/' + entityId);
    }
    getTrackFieldChangeBySelf(entityTypeId, entityId) {
        return this.apiSvc.query('dataChangeTracker/getTrackFieldChangeBySelf/' + entityTypeId + '/' + entityId);
    }
}
