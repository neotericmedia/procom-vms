// // https://github.com/angular-redux/store/blob/master/articles/epics.md
// // https://github.com/ngrx/platform/blob/master/docs/effects/README.md
// // https://redux-observable.js.org/docs/basics/Epics.html
// // https://github.com/angular-redux/example-app
// // https://github.com/angular-redux/example-app/blob/master/src/app/animals/api/epics.ts
// // https://medium.com/@m3po22/stop-using-ngrx-effects-for-that-a6ccfe186399
// // https://bertrandg.github.io/ngrx-effects-complex-stream-with-nested-actions/

// // angular
// import { createSelector } from 'reselect';
// import { Observable } from 'rxjs/Observable';
// import { of } from 'rxjs/observable/of';
// import { BehaviorSubject } from 'rxjs/BehaviorSubject';
// import { Epic, createEpicMiddleware } from 'redux-observable';
// import { Injectable, Inject } from '@angular/core';

// // common
// import { ReducerUtility } from '../../common/state/service/reducer.utility';
// import { StateService } from './../../common/state/service/state.service';
// import { ApiService } from '../../common/services/api.service';
// import { IAppState } from '../../common/state/epics/root.reducer';
// import { IEpic } from '../../common/state/epics/epics';

// // organization
// import { OrganizationAction } from './organization.action';
// import { IOrganization } from './organization.interface';
// import { organizationState } from './organization.state';

// @Injectable()
// export class OrganizationEpics implements IEpic<OrganizationAction.action> {
//     constructor(
//         private apiService: ApiService,
//         private stateService: StateService,
//     ) { }

//     getEpics() { return [this.epicOrganizationLoad]; }

//     private filterOrganizationAlreadyFetched = (organizationId: number, state: IAppState): boolean => state.getState().reduxOrganization.organizations && state.getState().reduxOrganization.organizations[organizationId];

//     private getObservableOrganization_from_Server = (organizationId: number, oDataParams?: any): Observable<IOrganization> =>
//         Observable.create(observer => {
//             console.log(`====apiService.Request==== OrganizationEpics.getObservableOrganization_from_Server: apiService.query('org?id='${organizationId})`);
//             this.apiService.query('org?id=' + organizationId + (oDataParams || ''))
//                 .then(
//                     (responseSuccess: any) => {
//                         console.log(`====apiService.ResponseSuccess==== OrganizationEpics.getObservableOrganization_from_Server: apiService.query('org?id='${organizationId}) : `, responseSuccess);
//                         observer.next(responseSuccess); observer.complete();
//                     },
//                     function (responseError) {
//                         console.log(`====apiService.ResponseError==== OrganizationEpics.getObservableOrganization_from_Server: apiService.query('org?id='${organizationId}) : `, responseError);
//                         observer.next(responseError); observer.complete();
//                     }
//                 );
//         })

//     private getObservableOrganization_from_Storage = (organizationId: number): Observable<IOrganization> =>
//         Observable.create(observer => {
//             return this.stateService.select<IOrganization>(organizationState.reduxOrganization.getOrganizationByOrganizationId(organizationId).organizationInstance)
//                 .subscribe((organization: IOrganization) => {
//                     console.log(`====storage==== OrganizationEpics.getObservableOrganization_from_Storage('organizationId='${organizationId})`);
//                     observer.next(organization); observer.complete();
//                 });
//         })

//     private epicOrganizationLoad: Epic<OrganizationAction.action, IAppState> = (action$, store) =>
//         action$
//             .ofType(OrganizationAction.type.OrganizationLoad)
//             .switchMap((action) => {
//                 // debugger;
//                 if (this.filterOrganizationAlreadyFetched(action.organizationId, store)) {
//                     return this.getObservableOrganization_from_Storage(action.organizationId)
//                         .map((organization: IOrganization) => new OrganizationAction.OrganizationAdd(organization.Id, organization))
//                         ;
//                 } else {
//                     return this.getObservableOrganization_from_Server(action.organizationId)
//                         .map((organization: IOrganization) => new OrganizationAction.OrganizationAdd(organization.Id, organization))
//                         .catch(response => of(new OrganizationAction.OrganizationLoadError(action.organizationId, response, { status: '' + response.status, })))
//                         .startWith(new OrganizationAction.OrganizationLoadStarted(action.organizationId))
//                         ;
//                 }
//             })




//     // private epicOrganizationLoad: Epic<OrganizationAction.action, IAppState> = (action$, store) =>
//     // action$
//     //     .ofType(OrganizationAction.type.OrganizationLoad)
//     //     .filter(action => !this.filterOrganizationAlreadyFetched(action.organizationId, store.getState().reduxOrganization))
//     //     .switchMap(action => this.apiService_GetOrganizationFromServer(action.organizationId)
//     //         .map((organization: IOrganization) => new OrganizationAction.OrganizationAdd(organization.Id, organization))
//     //         .catch(response => of(new OrganizationAction.OrganizationLoadError(action.organizationId, response, { status: '' + response.status, })))
//     //         .startWith(new OrganizationAction.OrganizationLoadStarted(action.organizationId))
//     //     )


//     // public createEpic(organizationId: number) { return createEpicMiddleware(this.epicOrganizationLoad(organizationId)); }
//     // private epicOrganizationLoad(organizationId: number, oDataParams?: any): Epic<OrganizationAction.action, IAppState> {
//     //     console.log(this.constructor.name + '.epicOrganizationLoad.organizationId=', organizationId);
//     //     return (action$, store) => action$
//     //         .ofType(OrganizationAction.type.OrganizationLoad)
//     //         .filter(() => !this.organizationAlreadyFetched(organizationId, store.getState().reduxOrganization))
//     //         .switchMap(() => this.getOrganizationFromServer(organizationId, oDataParams)
//     //             .map((organization: IOrganization) => new OrganizationAction.OrganizationAdd(organization.Id, organization))
//     //             .catch(response => of(new OrganizationAction.OrganizationLoadError(organizationId, response, { status: '' + response.status, })))
//     //             .startWith(new OrganizationAction.OrganizationLoadStarted(organizationId))
//     //         )
//     // };
// }
