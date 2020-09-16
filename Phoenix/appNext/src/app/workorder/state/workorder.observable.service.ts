// angular
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute, Router } from '@angular/router';
// common
import { getRouterState } from '../../common/state/router/reducer';
import { PhxConstants, CommonService } from '../../common';
import { ApiService } from '../../common/services/api.service';
import { StateService } from '../../common/state/service/state.service';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { IRouterState } from './../../common/state/router/reducer';
// workorder
import { IAssignmentDto, IWorkOrder, IWorkOrderVersion } from './workorder.interface';
import { WorkorderAction } from './workorder.action';
import { workorderState } from './workorder.state';
import { forEach, find, filter } from 'lodash';
import { WorkorderService } from '../workorder.service';
import { ControlFieldAccessibility } from '../control-field-accessibility';
import { AuthService } from '../../common/services/auth.service';
import { UserProfile } from '../../common/model';
import { WorkOrdernWorkflowComponent } from '../workorder-workflow/workorder-workflow.component';
import { CommonListsObservableService } from '../../common/lists/lists.observable.service';
import { CommonListsAction } from '../../common/lists';

const isDebugMode: boolean = true;

interface IGetWorkOrderParams {
  assignment?: IAssignmentDto;
  routerParams?: any;
  workerProfileTypes: any;
  Templates?: any;
  templateId?: any;
}

@Injectable()
export class WorkorderObservableService {
  showTemplate: boolean;
  entityId: number;
  constructor(
    private apiService: ApiService,
    private stateService: StateService,
    public commonService: CommonService,
    public workorderService: WorkorderService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private commonListsObservableService: CommonListsObservableService
  ) {
    console.log(this.constructor.name + '.constructor');
  }

  private muteFirst = <T, R>(first$: Observable<T>, second$: Observable<R>) => Observable.combineLatest(first$, second$, (a, b) => b).distinctUntilChanged();

  private getEntity(routerParams, showTemplate, oDataParams?: any, showLoader?: boolean): Promise<any> {
    const entityId: number = Number(showTemplate ? routerParams.templateId : routerParams.workorderId);
    if (showTemplate) {
      return this.apiService.query('template/' + entityId + (oDataParams || ''), showLoader);
    } else {
      return this.apiService.query('assignment/getByWorkOrderId/' + entityId + (oDataParams || ''), showLoader);
    }
  }

  private getObservableWorkorder_from_Server$ = (routerParams: any, showTemplate: boolean, showLoader: boolean = true, oDataParams?: any): Observable<IWorkOrder> =>
    Observable.create(observer => {
      const completeObserver = (workOrder = null) => {
        this.stateService.dispatchOnAction(new WorkorderAction.WorkorderAdd(this.entityId, workOrder));
        observer.next(workOrder);
        observer.complete();
      };
      Promise.all([
        this.getEntity(routerParams, showTemplate, false),
        new Promise((resolve, reject) => {
          this.commonListsObservableService.listUserProfileWorkers$().subscribe(response => {
            if (response) {
              resolve(response);
            }
          });
        }),
        new Promise((resolve, reject) => {
          this.authService.getCurrentProfile().subscribe((response: UserProfile) => {
            resolve(response);
          });
        })
      ])
        .then((result: Array<any>) => {
          const assignment: any = result[0];
          const workerProfileTypes = result[1];
          WorkOrdernWorkflowComponent.currentProfile = result[2];
          const valid = this.authenticateRoute(assignment, routerParams);
          if (!valid) {
            // redirect to home
            const navigateTo = () => {
              const navigatePath = `/home`;
              this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
                console.error(`app-organization: error navigating to home`, err);
              });
            };
            navigateTo();
            this.commonService.logError('Cannot match any routes');
          }
          this.dispatchDeleteRelatedLists();

          const workOrder = this.showTemplate
            ? {
                ...this.getWorkorder(
                  {
                    Templates: assignment,
                    templateId: this.entityId,
                    workerProfileTypes: workerProfileTypes
                  },
                  true
                )
              }
            : {
                ...this.getWorkorder(
                  {
                    assignment: assignment,
                    routerParams: routerParams,
                    workerProfileTypes: workerProfileTypes
                  },
                  false
                )
              };

          completeObserver(workOrder);
        })
        .catch(responseError => {
          completeObserver();
          this.commonService.logError('Work Order - ' + responseError.statusText);
        });
    });

  private getObservableWorkorder_from_Store = (Id: number): string => {
    return workorderState.reduxWorkorder.getWorkorderByWorkorderId(Id).workorderInstance;
  };

  private getIsLoading_from_store = (Id: number): boolean => {
    return this.stateService.select<boolean>(workorderState.reduxWorkorder.isLoading(Id)).value;
  };

  private getObservableWorkorder$ = (routerParams: any, showTemplate: boolean, showLoader: boolean): Observable<IWorkOrder> => {
    return this.stateService
      .select(this.getObservableWorkorder_from_Store(this.entityId))
      .filter(workOrder => !workOrder && !this.getIsLoading_from_store(this.entityId))
      .do(() => {
        this.stateService.dispatchOnAction(new WorkorderAction.WorkorderLoad(this.entityId));
      })
      .switchMap(() => this.getObservableWorkorder_from_Server$(routerParams, showTemplate, showLoader))
      .share();
  };

  public workorder$ = (component: BaseComponentOnDestroy, routerParams: any, showTemplate: boolean, showLoader: boolean = true): Observable<IWorkOrder> => {
    this.entityId = <number>(showTemplate ? routerParams.templateId : routerParams.versionId);
    this.showTemplate = showTemplate;
    return this.muteFirst(this.getObservableWorkorder$(routerParams, showTemplate, showLoader).startWith(null), this.stateService.select(this.getObservableWorkorder_from_Store(this.entityId))).takeUntil(component.isDestroyed$);
  };

  public workorderOnRouteChange$ = (component: BaseComponentOnDestroy, showLoader: boolean = true): Observable<IWorkOrder> => {
    return this.stateService
      .selectOnAction(getRouterState)
      .switchMap((routerState: IRouterState) => {
        return this.entityId ? this.workorder$(component, routerState.params, this.showTemplate, showLoader) : Observable.of(null);
      })
      .takeUntil(component.isDestroyed$);
  };

  public dispatchDeleteRelatedLists(): void {
    this.stateService.dispatchOnAction(new CommonListsAction.ListDelete(PhxConstants.CommonListsNames.UserProfileWorker));
    this.stateService.dispatchOnAction(new CommonListsAction.ListDelete(PhxConstants.CommonListsNames.UserProfileInternal));
    this.stateService.dispatchOnAction(new CommonListsAction.ListDelete(PhxConstants.CommonListsNames.Organizations));
    this.stateService.dispatchOnAction(new CommonListsAction.ListDelete(PhxConstants.CommonListsNames.OrganizationSuppliers));
  }

  private authenticateRoute(assignment, routerParams) {
    if (+routerParams.assignmentId && +routerParams.workorderId && +routerParams.versionId) {
      if (!this.showTemplate) {
        if (assignment.Id === +routerParams.assignmentId) {
          const workorder = assignment.WorkOrders.find(a => a.Id === +routerParams.workorderId);
          if (workorder) {
            const version = workorder.WorkOrderVersions.find(a => a.Id === +routerParams.versionId);
            if (version) {
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  getWorkorder(params: IGetWorkOrderParams, forTemplate: boolean) {
    const versionId = forTemplate ? 0 : Number(params.routerParams.versionId);
    const workorderDetails: IWorkOrder = <IWorkOrder>{};
    const workorder: any = forTemplate ? params.Templates.Entity.WorkOrders.find(a => a.Id === 0) : params.assignment.WorkOrders.find(a => a.Id === Number(params.routerParams.workorderId));

    if (forTemplate) {
      workorderDetails.TemplateId = params.templateId;
    }

    workorderDetails.TerminationDate = workorder.TerminationDate;
    workorderDetails.AtsPlacementId = forTemplate ? params.Templates.Entity.AtsPlacementId : params.assignment.AtsPlacementId;
    workorderDetails.AssignmentId = workorder.AssignmentId;

    if (!forTemplate) {
      workorderDetails.WorkOrderId = workorder.Id;
      workorderDetails.UserProfileIdWorker = params.assignment.UserProfileIdWorker;
    }

    workorderDetails.AssignmentStartDate = forTemplate ? params.Templates.Entity.StartDate : params.assignment.StartDate;
    workorderDetails.StatusId = workorder.StatusId;
    workorderDetails.IsDraftStatus = workorder.StatusId === PhxConstants.WorkOrderStatus.Processing && ControlFieldAccessibility.currentProfileUnderComplianceRole();
    // && workflowAvailableActions.filter(i => i.Name === 'Save').length > 0; //  && $scope.currentProfileUnderComplianceRole() // TODO: replace role check with WorkflowAvailableActions contains save action in ng2?

    if (!forTemplate) {
      workorderDetails.OrganizationIdInternal = params.assignment.OrganizationIdInternal;
    } else {
      workorderDetails.WorkOrderId = workorder.Id;
      workorderDetails.UserProfileIdWorker = params.Templates.Entity.UserProfileIdWorker;
      workorderDetails.OrganizationIdInternal = params.Templates.Entity.OrganizationIdInternal;
    }

    workorderDetails.StartDate = workorder.StartDate;
    workorderDetails.EndDate = workorder.EndDate;
    workorderDetails.IsPaymentStopped = workorder.IsPaymentStopped;
    workorderDetails.AssignmentStatus = forTemplate ? params.Templates.IsDraft : params.assignment.IsDraft;

    workorderDetails.workerProfileTypeId = forTemplate
      ? params.Templates.Entity.UserProfileIdWorker
        ? this.getWorkerProfileTypeId(params.workerProfileTypes, params.Templates.Entity.UserProfileIdWorker).ProfileTypeId
        : null
      : params.assignment.UserProfileIdWorker
      ? this.getWorkerProfileTypeId(params.workerProfileTypes, params.assignment.UserProfileIdWorker).ProfileTypeId
      : null;

    workorderDetails.workerContactId = forTemplate
      ? params.Templates.Entity.UserProfileIdWorker
        ? this.getWorkerProfileTypeId(params.workerProfileTypes, params.Templates.Entity.UserProfileIdWorker).ContactId
        : null
      : params.assignment.UserProfileIdWorker
      ? this.getWorkerProfileTypeId(params.workerProfileTypes, params.assignment.UserProfileIdWorker).ContactId
      : null;

    const version: IWorkOrderVersion = <IWorkOrderVersion>{};
    const currentVersion = forTemplate ? workorder.WorkOrderVersions[0] : workorder.WorkOrderVersions.find(a => a.Id === versionId);

    workorderDetails.readOnlyStorage = {
      IsDebugMode: isDebugMode,
      IsEditable: forTemplate
        ? true
        : currentVersion.StatusId === PhxConstants.WorkOrderVersionStatus.Draft ||
          currentVersion.StatusId === PhxConstants.WorkOrderVersionStatus.Declined ||
          currentVersion.StatusId === PhxConstants.WorkOrderVersionStatus.Recalled ||
          currentVersion.StatusId === PhxConstants.WorkOrderVersionStatus.RecalledCompliance ||
          (currentVersion.StatusId === PhxConstants.WorkOrderVersionStatus.ComplianceDraft &&
            ControlFieldAccessibility.currentProfileUnderComplianceRole()),
      AccessActions: forTemplate ? params.Templates.Entity.AccessActions : params.assignment.AccessActions
    };

    version.wovEndDate = currentVersion.wovEndDate;
    version.WorkOrderId = forTemplate ? params.Templates.Entity.Id : params.assignment.Id;
    version.Id = currentVersion.Id;
    version.WorkOrderNumber = forTemplate ? currentVersion.WorkOrderNumber : workorder.WorkOrderNumber;

    version.VmsWorkOrderReference = currentVersion.VmsWorkOrderReference;

    version.VersionNumber = currentVersion.VersionNumber;
    version.EffectiveDate = currentVersion.EffectiveDate;
    version.WorkOrderStartDateState = currentVersion.WorkOrderStartDateState;
    version.WorkOrderEndDateState = currentVersion.WorkOrderEndDateState;
    version.WorkOrderCreationReasonId = currentVersion.WorkOrderCreationReasonId;
    version.StatusId = currentVersion.StatusId;

    version.BillingInfoes = currentVersion.BillingInfoes;
    version.PaymentInfoes = currentVersion.PaymentInfoes;
    version.TimeSheetApprovers = currentVersion.TimeSheetApprovers ? currentVersion.TimeSheetApprovers : [];
    version.ExpenseApprovers = currentVersion.ExpenseApprovers ? currentVersion.ExpenseApprovers : [];
    version.WorkOrderVersionCommissions = currentVersion.WorkOrderVersionCommissions;

    version.SourceId = currentVersion.SourceId;
    version.IsDraft = currentVersion.IsDraft;
    version.IsComplianceDraftStatus = version.StatusId === PhxConstants.WorkOrderVersionStatus.ComplianceDraft || version.StatusId === PhxConstants.WorkOrderVersionStatus.RecalledCompliance;
    version.IsDraftStatus =
      version.StatusId === PhxConstants.WorkOrderVersionStatus.Draft ||
      version.StatusId === PhxConstants.WorkOrderVersionStatus.Declined ||
      version.StatusId === PhxConstants.WorkOrderVersionStatus.Recalled ||
      (version.IsComplianceDraftStatus && ControlFieldAccessibility.currentProfileUnderComplianceRole());
    // && workflowAvailableActions.filter(i => i.Name === 'Save').length > 0; //  && $scope.currentProfileUnderComplianceRole() // TODO: replace role check with WorkflowAvailableActions contains save action in ng2?
    version.LineOfBusinessId = currentVersion.LineOfBusinessId;
    version.PositionTitleId = currentVersion.PositionTitleId;
    version.AssignedToUserProfileId = currentVersion.AssignedToUserProfileId;
    version.TimeSheetCycleId = currentVersion.TimeSheetCycleId;
    version.TimeSheetDescription = currentVersion.TimeSheetDescription;
    version.TimeSheetPreviousApprovalRequired = currentVersion.TimeSheetPreviousApprovalRequired;
    version.TimeSheetMethodologyId = currentVersion.TimeSheetMethodologyId;
    version.TimeSheetApprovalFlowId = currentVersion.TimeSheetApprovalFlowId;
    version.IsTimeSheetUsesProjects = currentVersion.IsTimeSheetUsesProjects;
    version.IsDisplayEstimatedInvoiceAmount = currentVersion.IsDisplayEstimatedInvoiceAmount;
    version.IsDisplayEstimatedPaymentAmount = currentVersion.IsDisplayEstimatedPaymentAmount;
    version.IsExpenseRequiresOriginal = currentVersion.IsExpenseRequiresOriginal;
    version.IsExpenseUsesProjects = currentVersion.IsExpenseUsesProjects;
    version.ExpenseMethodologyId = currentVersion.ExpenseMethodologyId;
    version.ExpenseApprovalFlowId = currentVersion.ExpenseApprovalFlowId;
    version.ExpenseDescription = currentVersion.ExpenseDescription;
    version.ExpenseThirdPartyWorkerReference = currentVersion.ExpenseThirdPartyWorkerReference;
    version.WorksiteId = currentVersion.WorksiteId;
    version.InternalOrganizationDefinition1Id = currentVersion.InternalOrganizationDefinition1Id;
    version.InternalOrganizationDefinition2Id = currentVersion.InternalOrganizationDefinition2Id;
    version.InternalOrganizationDefinition3Id = currentVersion.InternalOrganizationDefinition3Id;
    version.InternalOrganizationDefinition4Id = currentVersion.InternalOrganizationDefinition4Id;
    version.InternalOrganizationDefinition5Id = currentVersion.InternalOrganizationDefinition5Id;
    version.WCBIsApplied = currentVersion.WCBIsApplied;
    version.SalesPatternId = currentVersion.SalesPatternId;
    version.JobOwnerUsesSupport = currentVersion.JobOwnerUsesSupport;
    version.HasRebate = currentVersion.HasRebate;
    version.RebateHeaderId = currentVersion.RebateHeaderId;
    version.RebateTypeId = currentVersion.RebateTypeId;
    version.RebateRate = currentVersion.RebateRate;
    version.HasVmsFee = currentVersion.HasVmsFee;
    version.VmsFeeHeaderId = currentVersion.VmsFeeHeaderId;
    version.VmsFeeTypeId = currentVersion.VmsFeeTypeId;
    version.VmsFeeRate = currentVersion.VmsFeeRate;
    version.IsEligibleForCommission = currentVersion.IsEligibleForCommission;
    version.IsThirdPartyImport = currentVersion.IsThirdPartyImport;
    version.CommissionThirdPartyWorkerReference = currentVersion.CommissionThirdPartyWorkerReference;
    version.ApplyFlatStatPay = currentVersion.ApplyFlatStatPay;
    version.Extended = currentVersion.extended;
    version.ValidateComplianceDraft = !(version.IsDraftStatus && !version.IsComplianceDraftStatus);
    version.WorkerCompensationId = currentVersion.WorkerCompensationId;

    forEach(version.WorkOrderVersionCommissions, com => {
      com.CommissionRates = [];
      com.CommissionRates.push({
        Description: com.Description
      });
    });

    version.JobOwner = find(currentVersion.WorkOrderVersionCommissions, obj => {
      return obj.CommissionRoleId === PhxConstants.CommissionRole.JobOwnerRoleNoSupport || obj.CommissionRoleId === PhxConstants.CommissionRole.JobOwnerRoleWithSupport;
    });
    version.SupportingJobOwners = filter(currentVersion.WorkOrderVersionCommissions, obj => {
      return obj.CommissionRoleId === PhxConstants.CommissionRole.SupportingJobOwner;
    });
    version.Recruiters = filter(currentVersion.WorkOrderVersionCommissions, obj => {
      return obj.CommissionRoleId === PhxConstants.CommissionRole.RecruiterRole;
    });

    if (currentVersion.IsDraftStatus) {
      if (!currentVersion.Recruiters) {
        currentVersion.Recruiters = [];
      }
      if (currentVersion.Recruiters.length === 0 && !currentVersion.IsRecruiterRemoved) {
        currentVersion.Recruiters.push(Object.assign({}));
      }
    }
    version.AllowTimeImport = currentVersion.AllowTimeImport;
    version.BillingTransactionGenerationMethodId = currentVersion.BillingTransactionGenerationMethodId;

    workorderDetails.WorkOrderVersion = version;
    if (!forTemplate) {
      workorderDetails.RootObject = params.assignment;
      workorderDetails.combinedAvailableStateActions = [].concat(params.assignment.AvailableStateActions || [], workorder.AvailableStateActions || [], currentVersion.AvailableStateActions || []);
    } else {
      workorderDetails.RootObject = {
        Id: 0,
        OrganizationCode: params.Templates.Entity.OrganizationCode,
        OrganizationIdInternal: params.Templates.Entity.OrganizationIdInternal,
        StatusId: params.Templates.StatusId,
        UserProfileIdWorker: params.Templates.Entity.UserProfileIdWorker,
        LastModifiedDateTime: params.Templates.LastModifiedDateTime,
        WorkOrders: params.Templates.Entity.WorkOrders
      };
    }
    return workorderDetails;
  }

  getWorkerProfileTypeId(workerProfileTypes: any, id: number) {
    const worker = workerProfileTypes.find(w => {
      return w.Id === id;
    });
    return worker;
  }
}
