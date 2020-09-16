import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { CommonService, ApiService, PhxConstants } from '../common/index';
import { AuthService } from '../common/services/auth.service';

declare var oreq;

@Injectable()
export class OrganizationBranchService {

    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        private authService: AuthService
    ) { }

    getCanCreate(): Observable<boolean> {
        return new Observable<boolean>(
            observer => {
                const canCreate = this.authService.hasFunctionalOperation(this.commonService.ApplicationConstants.FunctionalOperation.BranchEdit);
                if (canCreate == null) {
                    observer.error('error');
                } else {
                    observer.next(true);
                }
                observer.complete();
            }
        );
    }

    public getBranchById(id) {
        return Observable.fromPromise(this.apiService.query('branch/' + id));
    }

    public getUserProfileInternalList() {
        const filter = oreq.filter('ProfileStatusId')
            .eq(PhxConstants.ProfileStatus.Active)
            .or().filter('ProfileStatusId').eq(PhxConstants.ProfileStatus.PendingChange)
            .or().filter('ProfileStatusId').eq(PhxConstants.ProfileStatus.InActive)
            .or().filter('ProfileStatusId').eq(PhxConstants.ProfileStatus.PendingInactive)
            .or().filter('ProfileStatusId').eq(PhxConstants.ProfileStatus.PendingActive);
        const oDataParams = oreq.request()
            .withExpand(['Contact'])
            .withSelect(['Id', 'ProfileStatusId', 'Contact/FullName'])
            .withFilter(filter)
            .url();

        return Observable.fromPromise(this.apiService.query('UserProfile/getListUserProfileInternal' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '')));
    }

    public saveBranch(command) {
        return Observable.fromPromise(this.apiService.command('BranchSave', command));
    }

    public isCodeUnique(code) {
        return Observable.fromPromise(this.apiService.query('branch/isCodeUnique?code=' + code, false));
    }
}
