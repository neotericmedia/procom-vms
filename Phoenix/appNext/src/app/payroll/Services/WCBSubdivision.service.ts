

import { Injectable, Inject } from '@angular/core';
import { CommonService, ApiService } from "../../common/index";

@Injectable()
export class WCBSubdivisionService {

    constructor(
        private apiService: ApiService,
        private commonService: CommonService
    ) { }


    getWorkflowAvailableActions(EntityTypeId: string, VersionId: string) {
        return this.apiService.query('task/getTasksAvailableActionsByTargetEntity/targetEntityTypeId/' + EntityTypeId + '/targetEntityId/' + VersionId);
    }

    getFirstWorkflowCommand(taskTemplateId) {
        return this.apiService.query('task/getTaskTemplateFirstCommand/' + taskTemplateId);
    }

    getInternalOrgs() {
        return this.apiService.query('org/getOrganizations?$filter=IsOrganizationInternalRole eq true and IsDraft eq false');
    }
    getProfileTypes() {
        return this.apiService.query('code/getProfileTypes?$filter=IsWorker eq true');
    }

    callWorkflowCommand(command: any) {
        return this.apiService.command(command);
    }

    callWorkflowCommandWithCommandName(commandName: string, command: any) {
        return this.apiService.command(commandName, command);
    }

    getWCBSubdivisionHeaderByVersionId(versionId: string) {
        return this.apiService.query('payroll/getWCBSubdivisionHeaderByWCBSubdivisionVersionId/' + versionId);

    }
    getWCBSubdivisionIds() {
        return this.apiService.query('payroll/getWCBSubdivisionIds?$select=SubdivisionId');
    }

    getWorkerCompensations(SubdivisionId: string) {
        return this.apiService.query('Payroll/getAllWorkerCompensations?$filter=SubdivisionId eq ' + SubdivisionId + ' and StatusId eq ' + this.commonService.ApplicationConstants.WorkerCompensationStatus.Active);
    }

    getODataURL(): string {
        return this.commonService.api2Url + "oData/WCBSubdivision?$filter=WCBSubdivisionVersions/any(v: v/StatusId eq '2')&$expand=WCBSubdivisionVersions";
    }
}
