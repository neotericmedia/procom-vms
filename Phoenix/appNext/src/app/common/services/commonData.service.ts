import { ApiService } from './api.service';
import { Injectable, Inject } from '@angular/core';
import { CommonService } from './common.service';

import * as _ from 'lodash';


@Injectable()
export class CommonDataService {

    constructor(
        private apiService: ApiService
    ) { }

    data: {watchConfigOnWorkflowEvent: WatchConfigOnWorkflowEvent, scheduledProcesses: any[], customObjectByEntityTypeIdAndEntityId: any, organizationsListInternal: {Id: number, DisplayName: string, Code: string, IsTest: boolean}[]} = {
        watchConfigOnWorkflowEvent: { stateNameGo: '', stateIncludesFilter: '', groupingEntityTypeId: 0, targetEntityTypeId: 0, targetEntityId: 0, stateParamMapping: {}, functionCallBack: null },
        scheduledProcesses: [],
        customObjectByEntityTypeIdAndEntityId: {},
        organizationsListInternal: [],
    };

    getWatchConfigOnWorkflowEvent() {
        return _.cloneDeep(this.data.watchConfigOnWorkflowEvent);
    }


    setWatchConfigOnWorkflowEvent(stateNameGo: string, stateIncludesFilter: string, groupingEntityTypeId: number, targetEntityTypeId: number,
        targetEntityId: number, stateParamMapping: any, functionCallBack: any = null) {
        this.data.watchConfigOnWorkflowEvent.stateNameGo = _.cloneDeep(stateNameGo);
        this.data.watchConfigOnWorkflowEvent.stateIncludesFilter = _.cloneDeep(stateIncludesFilter);
        this.data.watchConfigOnWorkflowEvent.groupingEntityTypeId = _.cloneDeep(groupingEntityTypeId);
        this.data.watchConfigOnWorkflowEvent.targetEntityTypeId = _.cloneDeep(targetEntityTypeId);
        this.data.watchConfigOnWorkflowEvent.targetEntityId = _.cloneDeep(targetEntityId);
        this.data.watchConfigOnWorkflowEvent.stateParamMapping = _.cloneDeep(stateParamMapping);
        this.data.watchConfigOnWorkflowEvent.functionCallBack = functionCallBack;
    }

    getListOrganizationInternal(oDataParams?: any): Promise<{Id: number, DisplayName: string, Code: string, IsTest: boolean}[]> {
        const self = this;
        oDataParams =
            oDataParams ||
            oreq
                .request()
                .withSelect(['Id', 'DisplayName', 'Code', 'IsTest'])
                .url();

        return new Promise((resolve, reject) => {
            if (self.apiService.isEmptyObject(self.data.organizationsListInternal)) {
                self.apiService.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole?' + oDataParams).then(
                    (response: any) => {
                        self.data.organizationsListInternal = _.cloneDeep(response.Items);
                        resolve(self.data.organizationsListInternal);
                    },
                    (responseError) => {
                        self.data.organizationsListInternal = [];
                        reject(responseError);
                    }
                );
            } else {
                resolve(self.data.organizationsListInternal);
            }
        });
    }
}
class WatchConfigOnWorkflowEvent {
    stateNameGo: string;
    stateIncludesFilter: string;
    groupingEntityTypeId: number;
    targetEntityTypeId: number;
    targetEntityId: number;
    stateParamMapping: any;
    functionCallBack: (data: any) => void;
}
