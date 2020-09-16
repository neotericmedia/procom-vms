import { Injectable, Inject } from '@angular/core';
import * as _ from 'lodash';
import { CommonService } from './common.service';
@Injectable()
export class WorkflowDataService {
    serviceId = 'WorkflowDataService';

    data = {
        workflowHistoryModel: {}
    };

    constructor(
        private commonSvc: CommonService
    ) {
        // fix me
        // this.commonSvc.setControllerName(this.serviceId);
    }

    getWorkflowHistoryModel(entityTypeId: number) {
        return _.cloneDeep(this.data.workflowHistoryModel[entityTypeId]);
    }
    setWorkflowHistoryModel(entityTypeId: number, workflowHistoryData: any) {
        this.data.workflowHistoryModel[entityTypeId] = _.cloneDeep(workflowHistoryData);
    }

}
