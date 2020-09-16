import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ConcurrencyError } from './../../common/model/concurrency-error';
import { ActivityCentreSearchComponent } from './../activity-centre-search/activity-centre-search.component';
import { CodeValueService } from './../../common/services/code-value.service';
import { ActivatedRoute, Params, Router, UrlSegment } from '@angular/router';
import { Location, DecimalPipe } from '@angular/common';
import { Component, OnInit, ViewChild, OnDestroy, Inject } from '@angular/core';
import { ActivityCentreService } from '../activity-centre.service';
import { CommonService, NavigationService, ApiService, DialogService, LoadingSpinnerService, WorkflowService } from '../../common/index';
import { ActivityCard, ActivityCardFieldType, ACTIVITY_CENTRE_DEBUG, ActivityTotal, TaskType, ActivityNewItemCount, ActivityEntityConfigs, ActivityBatchConfiguration } from '../model/index';
import { PhxLocalizationService } from '../../common/services/phx-localization.service';
import { WorkflowAction, DialogResultType, BatchOperation, BatchCommand, DialogOptions } from '../../common/model/index';
import { PhxConstants } from '../../common/PhoenixCommon.module';

@Component({
  selector: 'app-activity-centre-summary',
  templateUrl: './activity-centre-summary.component.html',
  styleUrls: ['./activity-centre-summary.component.less'],
  providers: [DecimalPipe]
})
export class ActivityCentreSummaryComponent implements OnInit, OnDestroy {
  @ViewChild(ActivityCentreSearchComponent) search: ActivityCentreSearchComponent;

  componentName: string = 'ActivityCentreComponent';
  isAlive: boolean = true;

  // Activity Centre
  taskType$: Observable<TaskType>;
  entityTypeId$: Observable<number>;
  filters$: Observable<number[]>;
  countTotal$: Observable<ActivityTotal[]>;
  countTotalSubscription: Subscription;

  entityTypeId: number;
  statusIds: Array<number> = [];
  skip: number = 0;
  top: number = 25;
  startLoader: boolean = false;
  startLoaderOverlay: boolean = false;
  currCardList: number = 0;

  cardList: Array<ActivityCard> = [];
  cardTotals: Array<ActivityTotal> = [];
  hideBackButton: boolean = true;

  // Batch Operation
  batchOperations: BatchOperation[] = [];
  pendingBatchOperation: BatchOperation = null;
  notifyName: any = {
    NotifyName_BatchPreValidation_OnWarnings: this.componentName + 'NotifyName_BatchPreValidation_OnWarnings',
    NotifyName_BatchOperation_OnBatchMarkered: this.componentName + 'NotifyName_BatchOperation_OnBatchMarkered',
    NotifyName_BatchOperation_OnPreExecutionException: this.componentName + 'NotifyName_BatchOperation_OnPreExecutionException',
    NotifyName_BatchOperation_OnReleased: this.componentName + 'NotifyName_BatchOperation_OnReleased',
  };
  unregisterList: any[] = [];
  validationMessages: any;

  // Category Configuration
  entityConfig: ActivityBatchConfiguration;
  activityEntityConfigs: ActivityBatchConfiguration[] = ActivityEntityConfigs;

  constructor(
    protected navigationService: NavigationService,
    protected activityCentreService: ActivityCentreService,
    protected commonService: CommonService,
    protected activatedRoute: ActivatedRoute,
    protected codeValueService: CodeValueService,
    protected localizationService: PhxLocalizationService,
    protected dialogService: DialogService,
    protected apiService: ApiService,
    protected workflowService: WorkflowService,
    protected loadingSpinnerService: LoadingSpinnerService,
    protected router: Router,
    protected location: Location,
    protected decimalPipe: DecimalPipe
  ) {
    this.apiService.OnConcurrencyError
      .takeWhile(() => this.isAlive)
      .subscribe((data: ConcurrencyError) => {
        // TODO: verify the concurrency error is coming from this component?
        if (data.ReferenceCommandName === PhxConstants.CommandNamesSupportedByUi.WorkflowBatchOperationOnTasksSelected && data.TargetEntityTypeId === this.entityTypeId) {
          this.refreshData();
          this.pendingBatchOperation = null;  // batch command finished
        }
      });
  }

  setEntityTypeId(entityTypeId: number = 0) {
    if (entityTypeId !== this.entityTypeId) {
      this.entityTypeId = entityTypeId;
      this.entityConfig = this.activityEntityConfigs.find(x => x.entityTypeId === entityTypeId);
      if (!this.activatedRoute.firstChild) {
        this.statusIds = [];
      }
      this.refreshData();
      this.setPageTitle();
    }
  }

  ngOnInit() {
    // this.setEntityTypeId(0);
    this.setupPrivateEvents();

    this.entityTypeId$ = this.activatedRoute.params
      .map((params: Params) => {
        const id: number = +params['EntityTypeId'];
        return !Number.isNaN(id) ? id : 0;
      });

    this.taskType$ = this.activatedRoute.url
      .map((url: UrlSegment[]) => {
        const path: string = url[0].path;
        return path === 'all-tasks' ? TaskType.allTask : TaskType.myTask;
      });

    this.filters$ = this.activityCentreService.filterSelectionChange$();

    Observable.combineLatest(this.entityTypeId$, this.filters$)
      .takeWhile(() => this.isAlive)
      .subscribe(val => {
        const entityTypeId = val[0];
        const filters = val[1];
        this.statusIds = filters;
        if (entityTypeId !== this.entityTypeId) {
          this.setEntityTypeId(entityTypeId);
        } else {
          this.refreshData();
        }
      });

    this.countTotal$ = Observable.combineLatest(this.taskType$, this.entityTypeId$)
      .switchMap(ids => {
        if (ids.some(x => x == null)) {
          return Observable.empty<ActivityTotal[]>();
        }

        const result = { taskType: ids[0], entityTypeId: ids[1] };
        return this.activityCentreService.pollTotalCount(result.taskType, result.entityTypeId, () => this.isAlive);
      });

    if (!this.activatedRoute.firstChild) {
      this.activityCentreService.clearFilterSelection();
    }
  }

  ngOnDestroy() {
    this.isAlive = false;
    if (this.unregisterList && this.unregisterList.length) {
      for (const sub of this.unregisterList) {
        if (sub && sub.unsubscribe) {
          sub.unsubscribe();
        }
      }
    }
  }

  setPageTitle() {
    let pageTitle: string;

    if (this.entityTypeId) {
      pageTitle = this.activityCentreService.getLocalizedEntityName(this.entityTypeId);
    } else {
      pageTitle = this.localizationService.translate('common.generic.summary');
    }

    this.navigationService.setTitle('activity-center', [pageTitle]);
  }

  setBatchActions() {
    this.batchOperations = this.getTaskType === TaskType.myTask && this.entityConfig ? this.entityConfig.getBatchOperationButtons(this.statusIds) : [];
    for (const op of this.batchOperations) {
      op.Name = this.localizationService.translate(op.Name);
      op.SuccessMessage = this.localizationService.translate(op.SuccessMessage);
    }
  }

  addCards(showLoader: boolean = false) {
    const statusIdList = this.statusIds.length ? this.statusIds.join(',') : '';
    const self = this;

    return this.activityCentreService.getActivitySummary(this.getTaskType, this.skip, this.top, this.entityTypeId, statusIdList, showLoader)
      .then((cards: Array<ActivityCard>) => {
        const newCards = cards.filter(function (el, index, arr) {
          return self.cardList.find(z => z.entityId === el.entityId && z.entityTypeId === el.entityTypeId) === undefined;
        });
        this.cardList = this.cardList.concat(newCards);
        this.skip += newCards.length < this.top ? 0 : this.top; // TODO: handle when total becomes less than cardList, skip needs to decrement
        (this.currCardList !== this.cardList.length && !showLoader)
          ? this.startLoader = true : this.startLoader = false;
        this.startLoaderOverlay = this.startLoader;
      }).catch(ex => { });
  }

  refreshData() {
    if (this.countTotalSubscription) {
      this.countTotalSubscription.unsubscribe();
      this.countTotalSubscription = null;
    }
    if (this.search && this.search.selectedCards && this.search.selectedCards.size) {
      this.search.clearSelection();
    }
    this.cardList = [];
    this.skip = 0;
    this.startLoader = true;
    Promise.all([
      this.getTotals(),
      this.addCards(true)
    ]).then(() => {
      if (!this.countTotalSubscription) {
        this.subscribeCountTotal();
      }
    });
  }

  subscribeCountTotal() {
    this.countTotalSubscription = this.countTotal$
      .takeWhile(x => this.isAlive)
      .subscribe((response: ActivityTotal[]) => {
        let maxPendingTaskId = 0;
        const cardTotalsLen = this.cardTotals.length;
        const responseLen = response.length;
        if (cardTotalsLen === 0 && responseLen > 0 || cardTotalsLen > 0 && responseLen === 0) {
          // refresh the data when switching between hooray view and cards view
          this.statusIds = [];
          this.refreshData();
        } else {
          // handling circle removal
          for (let i = cardTotalsLen - 1; i >= 0; i--) {
            if (!response.find(total => total.entityTypeId === this.cardTotals[i].entityTypeId && total.statusId === this.cardTotals[i].statusId)) {
              if ((this.cardTotals[i].isActive && this.statusIds.length > 1) || !this.cardTotals[i].isActive) {
                // remove the circle when the filter is not the only one selected, or it is not active. Not touching the card list.
                this.cardTotals.splice(i, 1);
                this.statusIds = this.statusIds.filter(statusId => this.cardTotals.some(total => total.statusId === statusId));
              } else {
                // refresh the data when the circle is the only filter selected
                this.statusIds = [];
                this.refreshData();
              }
            }
          }
          for (const t of response) {
            if (t.maxPendingTaskId > maxPendingTaskId) {
              maxPendingTaskId = t.maxPendingTaskId;
            }
            const existing = this.cardTotals.find(total => total.entityTypeId === t.entityTypeId && total.statusId === t.statusId);
            if (existing && !existing.showBadge && (t.maxPendingTaskId !== existing.maxPendingTaskId || t.total !== existing.total)) {
              existing.showBadge = true;
            } else if (!existing) {
              t.showBadge = true;
              this.cardTotals.push(t);
            }
          }
        }
      });
  }

  getTotals() {

    // reset all new count when there's no filter selected since we are showing all
    const resetAllNewCount: boolean = !this.hasStatusIds();

    return Promise.all([
      this.activityCentreService.getActivityTotals(this.getTaskType, this.cardTotals, this.entityTypeId, resetAllNewCount),
      this.entityTypeId ? this.activityCentreService.existsOtherEntityType(this.getTaskType, this.entityTypeId) : null
    ])
      .then((result) => {
        const len = Array.isArray(result) ? result.length : 0;
        const cardTotals = len >= 1 ? result[0] : [];
        const existsOtherEntityType = len >= 2 ? result[1] : false;

        if (this.entityTypeId === 0 && Array.isArray(cardTotals) && cardTotals.length === 1) {
          const taskType = this.activatedRoute.snapshot.url[0].path;
          const url = `next/activity-centre/${taskType}/${cardTotals[0].linkTo}`;
          this.router.navigateByUrl(url);
        } else {
          this.hideBackButton = !existsOtherEntityType;
          this.cardTotals = cardTotals;
        }

        // remove invalid statusIds
        this.statusIds = this.statusIds.filter(statusId => this.cardTotals.some(total => total.statusId === statusId));
        this.cardTotals.forEach(x => {
          x.isActive = this.statusIds.includes(x.statusId);
        });

        this.setBatchActions();
      });
  }

  private hasStatusIds() {
    return this.statusIds ? !!this.statusIds.length : false;
  }

  onScroll() {
    if (this.currCardList === 0 && this.cardList.length >= this.top) {
      this.startLoader = true;
      this.startLoaderOverlay = this.startLoader;
    }
    this.currCardList = this.cardList.length;
    this.addCards();
  }

  onDrillDown(totals: Array<ActivityTotal> = []) {
    this.statusIds = totals.map((t: ActivityTotal) => {
      if (t.statusId) {
        return t.statusId;
      }
    });
    const path = this.activatedRoute.snapshot.url;
    const filterPath = (this.statusIds && this.statusIds.length ? `/${this.statusIds.join(',')}` : '');
    const url = `next/activity-centre/${path[0]}/${path[1]}${filterPath}`;

    if (this.location.isCurrentPathEqualTo('/' + url)) {
      this.router.navigate(['/dummy'], { skipLocationChange: true }).then(() => {
        this.router.navigateByUrl(url);
      });
    } else {
      this.router.navigateByUrl(url);
    }
  }

  setupPrivateEvents() {

    this.apiService.onPrivate(this.notifyName.NotifyName_BatchPreValidation_OnWarnings, (event, data) => {
      if (this.pendingBatchOperation) {
        let body: string = null;
        let options: DialogOptions = null;

        if (data.TimeSheetExceptions && data.TimeSheetExceptions.length > 0) {
          body = `<p>${this.localizationService.translate('activityCentre.messages.timeSheetWarningUnitsOnHolidayWeekend')}</p>`;
          body += `<ul class="list-unstyled">`;
          for (const ts of data.TimeSheetExceptions) {
            const startDate = this.activityCentreService.toDate(ts.StartDate);
            const endDate = this.activityCentreService.toDate(ts.EndDate);
            const startEndDate = `${startDate} - ${endDate}`;
            const codeUnitType = this.codeValueService.getCodeValue(ts.RateUnitId, this.commonService.CodeValueGroups.RateUnit);
            const unitType = ts.Units > 0 ? codeUnitType.description : codeUnitType.text;

            body += `<li><b>${ts.Worker}</b> ${startEndDate}, <b>${ts.Units}</b> ${unitType}</li>`;
          }
          body += `</ul>`;
          options = { size: 'md' };
        }

        if (data.ExpenseClaimExceptions && data.ExpenseClaimExceptions.length > 0) {
          body = `<p>${this.localizationService.translate('activityCentre.messages.expenseWarningPhoneInternetOverage')}</p>`;
          body += `<ul class="list-unstyled">`;
          for (const ec of data.ExpenseClaimExceptions) {
            const startDate = this.activityCentreService.toDate(ec.StartDate);
            const endDate = this.activityCentreService.toDate(ec.EndDate);
            const startEndDate = `${startDate} - ${endDate}`;
            const codeCurrency = this.codeValueService.getCodeValue(ec.CurrencyId, this.commonService.CodeValueGroups.Currency);
            const currency = ec.CurrencyId > 0 ? codeCurrency.code : '';
            const total = this.decimalPipe.transform(ec.TotalAmount, '1.2');
            body += `<li><b>${ec.Worker}</b> ${startEndDate}, <b>$${total}</b> ${currency}</li>`;
          }
          body += `</ul>`;
          options = { size: 'md' };
        }

        this.confirmExecuteBatchOperation(this.pendingBatchOperation, body, options);

      }
    }).then(unregister => {
      this.unregisterList.push(unregister);
    });

    this.apiService.onPrivate(this.notifyName.NotifyName_BatchOperation_OnException, (event, data) => {
      this.refreshOnPrivateEvent(data, true, this.localizationService.translate('common.batch.exception'));
      this.pendingBatchOperation = null; // batch command finished
    }).then((unregister) => {
      this.unregisterList.push(unregister);
    });

    this.apiService.onPrivate(this.notifyName.NotifyName_BatchOperation_OnBatchMarkered, (event, data) => {
      this.refreshOnPrivateEvent(data, true, null);
    }).then((unregister) => {
      this.unregisterList.push(unregister);
    });

    this.apiService.onPrivate(this.notifyName.NotifyName_BatchOperation_OnPreExecutionException, (event, data) => {
      this.refreshOnPrivateEvent(data, true, this.localizationService.translate('common.batch.onBatchPreValidation') + ':');
      this.pendingBatchOperation = null; // batch command finished
    }).then((unregister) => {
      this.unregisterList.push(unregister);
    });

    this.apiService.onPrivate(this.notifyName.NotifyName_BatchOperation_OnReleased, (event, data) => {
      const successMessage: string = this.pendingBatchOperation ? this.pendingBatchOperation.SuccessMessage : this.localizationService.translate('common.batch.success');

      this.refreshOnPrivateEvent(data, false, data.CountAll !== data.CountExecutionSuccess
        ? this.localizationService.translate('common.batch.someItemsNotProcessed')
        : successMessage);

      this.pendingBatchOperation = null; // batch command finished

    }).then((unregister) => {
      this.unregisterList.push(unregister);
    });
  }

  onExecuteBatchOperation(operation: BatchOperation) {
    this.pendingBatchOperation = operation;

    if (operation.TaskIdsToBatch.length) {
      if (operation.BatchPreValidationCommandName) {
        this.apiService.command(operation.BatchPreValidationCommandName, {
          LastModifiedDateTime: new Date(),
          NotifyName_BatchPreValidation_OnReleased: this.notifyName.NotifyName_BatchPreValidation_OnWarnings,
          TaskIdsToBatch: operation.TaskIdsToBatch
        })
          .then((res) => {
            // Wait for pre-validation private event (TODO: register new event listener + unregister immediately after?)
          })
          .catch((err) => {
            this.commonService.logError(`Error validating ${operation.Name.toLowerCase()}`, err);
            this.pendingBatchOperation = null;
          });
      } else {
        this.confirmExecuteBatchOperation(operation);
      }

    } else {
      this.commonService.logError(`Select items(s) to ${operation.Name.toLowerCase()}`);
    }
  }

  confirmExecuteBatchOperation(operation: BatchOperation, message?: string, dialogOptions?: DialogOptions) {
    const newLine: string = '<br/>';
    const count: number = operation.TaskIdsToBatch.length;
    const header = this.localizationService.translate('common.generic.confirm');
    const body = (message ? message : '')
      + `<p>${this.localizationService.translate(operation.ConfirmMessage + (count > 1 ? 'Multiple' : 'Single'), count)}</p>`;

    this.dialogService.confirm(header, body, dialogOptions)
      .then((button) => {
        if (button === DialogResultType.Yes) {
          this.executeBatchOperation(operation);
        } else {
          this.pendingBatchOperation = null;
        }
      });
  }

  executeBatchOperation(operation: BatchOperation) {
    this.loadingSpinnerService.show();

    const batchCommand: BatchCommand = {
      TaskIdsToBatch: operation.TaskIdsToBatch,
      TaskResultId: operation.TaskResultId,
      NotifyName_BatchOperation_OnBatchMarkered: this.notifyName.NotifyName_BatchOperation_OnBatchMarkered,
      NotifyName_BatchOperation_OnPreExecutionException: this.notifyName.NotifyName_BatchOperation_OnPreExecutionException,
      NotifyName_BatchOperation_OnReleased: this.notifyName.NotifyName_BatchOperation_OnReleased,
      CommandBatchPreExecutionJsonBody: {
        CommandName: operation.BatchPreExecutionCommandName,
        WorkflowPendingTaskId: -1,
        ToSendNotifyOnPreExecutionNotValidResult: true,
      },
      CommandBatchThreadExecutionJsonBody: {
        CommandName: operation.BatchThreadExecutionCommandName,
        Comments: operation.Comments, // TODO: batch operation should have method that returns json bodies?
      }
    };

    this.workflowService.workflowBatchOperationOnTasksSelected(batchCommand)
      .then((res) => {
        this.loadingSpinnerService.hide();
      })
      .catch((err) => {
        this.loadingSpinnerService.hideAll();
        this.commonService.logError(`Error executing ${operation.Name.toLowerCase()}`, err);
      });
  }

  private refreshOnPrivateEvent(data: any, toCallServer: boolean, message: string) {

    const newLine: string = '<br/>';
    if (message !== null && typeof data.CountAll !== 'undefined' && data.CountAll !== null && typeof data.CountExecutionSuccess !== 'undefined' && data.CountExecutionSuccess !== null) {
      if (data.CountExecutionSuccess > 0) {
        message += newLine + this.localizationService.translate('common.batch.countItemsProcessedMessage', data.CountExecutionSuccess, data.CountAll);
      }
      if (data.CountAll - data.CountExecutionSuccess > 0) {
        message += + newLine + this.localizationService.translate('common.batch.countItemsNotProcessedMessage', (data.CountAll - data.CountExecutionSuccess), data.CountAll);
      }

      if (data.CountAll === data.CountExecutionSuccess) {
        this.commonService.logSuccess(message);
      } else {
        this.commonService.logError(message);
      }
    }

    if (typeof data.ValidationMessages !== 'undefined' && data.ValidationMessages && Object.keys(data.ValidationMessages).length !== 0) {
      // this.ValidationMessages = data;
    }

    if (toCallServer) {
      this.refreshData();
    }
  }

  get getTaskType(): TaskType {
    const urlPath = this.activatedRoute.snapshot.url.length > 0 ? this.activatedRoute.snapshot.url[0].path : 'my-tasks';

    switch (urlPath.toLowerCase()) {
      case 'all-tasks':
        return TaskType.allTask;
      default:
        return TaskType.myTask;
    }
  }
}
