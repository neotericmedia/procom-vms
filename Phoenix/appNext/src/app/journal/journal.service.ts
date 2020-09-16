import { Injectable } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

import { JournalEntity } from './journal-search/journal-entity';

import { CommonService, ApiService } from '../common/index';
import { EntityList } from '../common/model';

@Injectable()
export class JournalService {

    constructor(
        private apiService: ApiService,
        private domSanitizer: DomSanitizer,
        private commonService: CommonService
    ) { }

    docUrl(batchId: number, url: string): SafeResourceUrl {
        return this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.commonService.api2Url}${'api/journal'}/${batchId}/${url}?access_token=${this.commonService.bearerToken()}`);
    }

    public getJournalOrgs(oDataParams): Promise<EntityList<any>> {
        return this.apiService.query(`journal/pending-export?${oDataParams}`);
    }

    public getJournalOrgsGrouped(oDataParams): Promise<EntityList<any>> {
        return this.apiService.query(`journal/pending-export-grouped-counts?${oDataParams}`);
    }

    public generateFinancialBatch(command) {
        return this.apiService.command('FinancialTransactionBatchNew', command);
    }

    public streamByBatchId(batchId) {
        return this.apiService.query('journal/' + batchId + '/csvStreamByBatchId');
    }

}
