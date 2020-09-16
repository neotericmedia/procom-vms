

import { Injectable } from '@angular/core';
import { CommonService, ApiService } from '../../common/index';

@Injectable()
export class WorkerCompensationService {

    constructor(
        private apiService: ApiService,
        private commonService: CommonService
    ) { }

    getODataURL(): string {
        return this.commonService.api2Url + 'oData/WorkerCompensation';
    }
    saveWorkerCompensation(command: any) {
        return this.apiService.command('WorkerCompensationSave', command);
    }

    deactivateWorkerCompensation(command: any) {
        return this.apiService.command('WorkerCompensationDeactivate', command);
    }

    activateWorkerCompensation(command: any) {
        return this.apiService.command('WorkerCompensationActivate', command);
    }

    getWorkerCompensationById(id: number) {
        return this.apiService.query('Payroll/getWorkerCompensation/' + id);
    }
}
