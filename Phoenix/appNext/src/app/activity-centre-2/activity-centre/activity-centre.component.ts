import { Component, OnInit, HostListener } from '@angular/core';
import { ActivityCentreService } from './../shared/activity-centre.service';
import { StateService } from '../../common/state/service/state.service';
import { getRouterState, IRouterState } from '../../common/state/router/reducer';
import { TaskType, ISortField, ActivityCentreModuleResourceKeys } from '../model';
import { flatMap, sumBy, map, orderBy, some } from 'lodash';
import { PhxConstants, CodeValueService, NavigationService, PhxLocalizationService } from '../../common';
import { FormBuilder, FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { ActivityCentreT3FilterComponent } from '../activity-centre-t3-filter/activity-centre-t3-filter.component';
import { IRoot, IFormGroupSetup, IT3Filter, IGlobalFilter, IStatus, IEntityStatus } from './../model/activity-centre-interface';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { ActivityCentreT2FilterComponent } from '../activity-centre-t2-filter/activity-centre-t2-filter.component';
import { AuthService } from '../../common/services/auth.service';
import * as moment from 'moment';
import { SortFields, SortDirection } from '../model/activity-centre-enum';

@Component({
  selector: 'app-activity-centre',
  templateUrl: './activity-centre.component.html',
  styleUrls: ['./activity-centre.component.less']
})

export class ActivityCentreComponent extends BaseComponentOnDestroy implements OnInit {
  public rootFormGroup: FormGroup<IRoot>;
  formGroupSetup: IFormGroupSetup;
  taskType: any;
  showFilter: boolean = false;
  showScrollTop: boolean = false;
  isPositionFixed: boolean = false;
  cardList: Array<any> = [];
  showedCardList: Array<any> = [];
  t2FilterStatuses: any;
  pageSizeForCards: number = 30;
  globalFilter: IGlobalFilter = <IGlobalFilter>{};
  filterCount: number = 0;
  phxConstants: typeof PhxConstants;
  entityItems: any = [];
  t1Status: any;
  loading: boolean = false;
  isClientListVisible: boolean = false;
  defaultPageSize: number = 35000;
  componentName: string = 'Activity-Center-Component';
  lastSavedState: any = {};
  sortFields: Array<ISortField> = [];

  constructor(private activityCentreService: ActivityCentreService,
    private stateService: StateService,
    private formBuilder: FormBuilder,
    private codeValueService: CodeValueService,
    private authService: AuthService,
    private navigationService: NavigationService,
    protected localizationService: PhxLocalizationService) {
    super();
    this.formGroupSetup = { formBuilder: this.formBuilder };
    this.checkScreen();
    this.canShowClientListInT3Filter();
  }

  canShowClientListInT3Filter() {
    this.authService.getCurrentProfile().subscribe((user: any) => {
      if (user && user.ProfileTypeId) {
        this.isClientListVisible = (user.ProfileTypeId === PhxConstants.UserProfileType.Internal);
      }
    });
  }

  ngOnInit() {
    this.phxConstants = PhxConstants;
    this.navigationService.setTitle('activity-center');
    this.stateService.selectOnAction(getRouterState).switchMap((routerStateResult: IRouterState) => {
      this.globalFilter = {
        T1Filter: 0,
        T2Filter: [],
        EntityTypes: [],
        TaskOwners: null,
        Clients: [],
        Groups: [],
        Users: [],
        StartDate: null,
        EndDate: null,
        SortBy: SortFields.TimeInState,
        SortDirection: SortDirection.Desc,
        PageSize: null
      };
      this.lastSavedState.State = this.globalFilter;
      if (routerStateResult.location.includes('to-do')) {
        this.globalFilter.T1Filter = TaskType.toDo;
      } else if (routerStateResult.location.includes('in-progress')) {
        this.globalFilter.T1Filter = TaskType.inProgress;
      } else if (routerStateResult.location.includes('completed')) {
        this.globalFilter.T1Filter = TaskType.completed;
      }
      this.filterCount = 0;
      this.t1Status = this.globalFilter.T1Filter;
      return this.activityCentreService.getState(this.componentName, 'ActivityCentreState');
    }).takeUntil(this.isDestroyed$).subscribe((state: any) => {
      if (state.Items && state.Items.length) {
        this.lastSavedState = state.Items[0];
        this.lastSavedState.State = JSON.parse(this.lastSavedState.State);
      }
      this.getT2FilterStatuses();
    });

    this.sortFields = this.getSortFields();
    this.sortFields = this.sortFields.map(i => {
      i.isSelected = (this.globalFilter.SortBy === i.SortField && this.globalFilter.SortDirection === i.SortDirection);
      return i;
    });
  }

  getT2FilterStatuses() {
    this.activityCentreService.getStatusCount(this.globalFilter.T1Filter).takeUntil(this.isDestroyed$).subscribe((statuses: any) => {
      const statusOrder = this.getStatusOrder(this.globalFilter.T1Filter);
      const unknownStatuses: any = [];
      let otherStatus: any = [];
      let statusArray = statuses.Statuses.map((val) => {
        const firstEntitiyStatus = val.EntityStatusMapping[0];
        val.DisplayName = this.codeValueService.getCodeValueText(firstEntitiyStatus.EntityStatusId, firstEntitiyStatus.CodeValueTableName);
        const item = statusOrder.find(a => a.GroupKey === val.GroupKey);
        val.isActive = some(this.lastSavedState.State.T2Filter, a => a === val.GroupKey);
        val = { ...val, ...item };
        if (!item) {
          unknownStatuses.push(val);
        } else {
          val.order = item.order;
        }
        return val;
      });
      const knownStatuses = statusArray.filter(a => a.order >= 0);
      if (unknownStatuses.length) {
        const unknownEntityStatus = flatMap(unknownStatuses, (status: any) => status.EntityStatusMapping);
        otherStatus = {
          GroupKey: 'others',
          EntityStatusMapping: unknownEntityStatus,
          Count: sumBy(unknownEntityStatus, 'Count'),
          DisplayName: 'Others',
        };
      }
      statusArray = knownStatuses.concat(otherStatus);
      statuses.Statuses = orderBy(statusArray, ['order'], ['asc']);
      this.t2FilterStatuses = { ...statuses };
      this.entityItems = ActivityCentreT3FilterComponent.filterEntities(statuses.Statuses);
      this.formBuilderGroupSetup(this.formGroupSetup, this.updateT2AndT3ByLastSavedState());
      this.setGlobalFilter();
      if (this.rootFormGroup) {
        this.filterCount = ActivityCentreT3FilterComponent.findFilterCount(<FormGroup<IT3Filter>>this.rootFormGroup.controls.T3Filter);
      }
      this.globalFilter.PageSize = this.t2FilterStatuses.Count ? this.t2FilterStatuses.Count : this.defaultPageSize;
      this.getCards(true);
    });
  }

  updateT2AndT3ByLastSavedState() {
    this.resetCardList();
    const filterObj = {
      T2Values: {
        ...this.t2FilterStatuses,
        AllItem: this.t2FilterStatuses.Statuses.filter(a => a.isActive).length ? false : true,
      },
      T3Values: {
        AllEntities: !this.lastSavedState.State.EntityTypes.length ? true : false,
        KeyWord: null,
        StartDate: this.lastSavedState.State.StartDate,
        EndDate: this.lastSavedState.State.EndDate,
        Client: this.lastSavedState.State.Clients,
        TaskOwner: this.lastSavedState.State.TaskOwners,
        FilterName: null,
        EntityItems: this.findSumByT2Status(this.t2FilterStatuses, this.entityItems.map(x => {
          x.FilterSelected = some(this.lastSavedState.State.EntityTypes, a => a === x.EntityTypeId);
          return x;
        }))
      }
    };
    return filterObj;
  }

  setGlobalFilter() {
    const t2FormValues = this.rootFormGroup.controls.T2Filter.value;
    const t3FormValues = this.rootFormGroup.controls.T3Filter.value;
    this.globalFilter = {
      ...this.globalFilter,
      T2Filter: flatMap(t2FormValues.Statuses.filter(x => x.isActive), a => a.EntityStatusMapping).map(a => {
        return {
          EntityTypeId: a.EntityTypeId,
          EntityStatusId: a.EntityStatusId
        };
      }),
      EntityTypes: t3FormValues.EntityItems.filter(x => x.FilterSelected).map(a => a.EntityTypeId),
      TaskOwners: t3FormValues.TaskOwner,
      Clients: t3FormValues.Client,
      Groups: [],
      Users: [],
      StartDate: t3FormValues.StartDate ? moment(t3FormValues.StartDate).format('YYYY-MM-DD') : null,
      EndDate: t3FormValues.EndDate ? moment(t3FormValues.EndDate).format('YYYY-MM-DD') : null,
    };
    if (!this.globalFilter.StartDate) {
      delete this.globalFilter.StartDate;
    }
    if (!this.globalFilter.EndDate) {
      delete this.globalFilter.EndDate;
    }
  }

  getStatusOrder(filterType: number) {
    if (filterType === TaskType.toDo || filterType === TaskType.inProgress) {
      return [
        { 'order': 0, 'GroupKey': 'New' },
        { 'order': 1, 'GroupKey': 'Open' },
        { 'order': 2, 'GroupKey': 'Draft' },
        { 'order': 3, 'GroupKey': 'Recalled' },
        { 'order': 4, 'GroupKey': 'Recalled to Draft' },
        { 'order': 5, 'GroupKey': 'Declined' },
        { 'order': 6, 'GroupKey': 'Accounting Draft' },
        { 'order': 7, 'GroupKey': 'Recalled to Accounting' },
        { 'order': 8, 'GroupKey': 'Pending Upload' },
        { 'order': 9, 'GroupKey': 'Pending Supporting Documents' },
        { 'order': 10, 'GroupKey': 'Pending Supporting Document Upload' },
        { 'order': 11, 'GroupKey': 'Pending Supporting Document Review' },
        { 'order': 12, 'GroupKey': 'Pending Client Review' },
        { 'order': 13, 'GroupKey': 'Pending Supplier Review' },
        { 'order': 14, 'GroupKey': 'Pending Backoffice Review' },
        { 'order': 15, 'GroupKey': 'Pending Internal Review' },
        { 'order': 16, 'GroupKey': 'Pending Review' },
        { 'order': 17, 'GroupKey': 'Pending Release' },
        { 'order': 18, 'GroupKey': 'Pending Exemption Request' },
        { 'order': 19, 'GroupKey': 'Pending Snooze Request' },
        { 'order': 20, 'GroupKey': 'Pending Deactivation' },
        { 'order': 21, 'GroupKey': 'Pending Unterminate' },
        { 'order': 22, 'GroupKey': 'Pending Snooze' },
        { 'order': 23, 'GroupKey': 'Pending Activation' },
        { 'order': 24, 'GroupKey': 'On Hold' },
        { 'order': 25, 'GroupKey': 'Cheque Released' },
        { 'order': 26, 'GroupKey': 'Change in Progress' },
      ];
    } else if (filterType === TaskType.completed) {
      return [
        { 'order': 0, 'GroupKey': 'Active ' },
        { 'order': 1, 'GroupKey': 'Inactive' },
        { 'order': 2, 'GroupKey': 'Approved' },
        { 'order': 3, 'GroupKey': 'Approved and Accepted' },
        { 'order': 4, 'GroupKey': 'Exemption' },
        { 'order': 5, 'GroupKey': 'Snooze' },
        { 'order': 6, 'GroupKey': 'Expired' },
        { 'order': 7, 'GroupKey': 'Terminated' },
        { 'order': 8, 'GroupKey': 'Released' },
        { 'order': 9, 'GroupKey': 'Marked Paid' },
      ];
    } else {
      return [];
    }
  }

  canShowFilter(showFilter) {
    this.showFilter = showFilter;
  }

  onScrolled() {
    this.visibleCardList();
  }

  t2FilterStatusChanged($event) {
    this.setGlobalFilter();
    this.updateT3Filter();
    this.resetCardList();
    this.saveActivityCentreState($event);
    this.getCards(true);
  }

  t3FilterDetailsChanged($event) {
    if (this.rootFormGroup) {
      this.filterCount = ActivityCentreT3FilterComponent.findFilterCount(<FormGroup<IT3Filter>>this.rootFormGroup.controls.T3Filter);
    }
    this.setGlobalFilter();
    this.resetCardList();
    this.saveActivityCentreState();
    this.getCards();
  }

  updateT3Filter() {
    const t2FilterFormValues = this.rootFormGroup.value.T2Filter;
    const t3FilterFormValues = this.rootFormGroup.value.T3Filter;
    t3FilterFormValues.EntityItems = this.findSumByT2Status(t2FilterFormValues, t3FilterFormValues.EntityItems);
    const controlArray: FormGroup<IT3Filter> = ActivityCentreT3FilterComponent.formBuilderGroupSetup(this.formGroupSetup, t3FilterFormValues) as FormGroup<IT3Filter>;
    this.rootFormGroup.setControl('T3Filter', controlArray);
  }

  findSumByT2Status(t2FilterFormValues, entityItems) {
    const selectedEntites = flatMap(some(t2FilterFormValues.Statuses, a => a.isActive) ?
      t2FilterFormValues.Statuses.filter(a => a.isActive) : t2FilterFormValues.Statuses, a => a.EntityStatusMapping);
    return map(entityItems, entity => {
      return {
        ...entity,
        Count: sumBy(selectedEntites.filter(a => a.EntityTypeId === entity.EntityTypeId), 'Count')
      };
    });
  }

  getCards(reset = false) {
    this.loading = true;
    this.activityCentreService.getCardList(this.globalFilter).takeUntil(this.isDestroyed$).subscribe((result: any) => {
      this.cardList = result;
      this.visibleCardList(reset);
      this.loading = false;
    });
  }

  visibleCardList(reset = false) {
    this.showedCardList = reset ? [] : this.showedCardList;
    this.showedCardList = this.showedCardList.concat(this.cardList.slice(this.showedCardList.length, this.showedCardList.length + this.pageSizeForCards));
  }

  resetCardList() {
    this.cardList = this.showedCardList = [];
  }

  trackByFn(index: number) {
    return index;
  }

  onScrollToTop() {
    if (window.scrollY > 500) {
      this.showScrollTop = true;
      window.scroll(0, 0);
    } else {
      this.showScrollTop = false;
    }
  }

  checkScreen() {
    if (window.innerWidth >= 1200) {
      this.showFilter = true;
    }
  }

  filterClick() {
    this.showFilter = !this.showFilter;
  }

  setRefreshData() {
    this.getT2FilterStatuses();
  }

  saveActivityCentreState(event = null) {
    const commandBody = this.lastSavedState = {
      Id: this.lastSavedState && this.lastSavedState.Id ? this.lastSavedState.Id : 0,
      LastModifiedDatetime: new Date(Date.now()),
      ComponentName: this.componentName,
      StateName: 'ActivityCentreState',
      State: {
        ...this.globalFilter,
        T2Filter: event ? event.map(a => a.GroupKey) : this.lastSavedState.State.T2Filter,
      },
      StateDescription: null
    };
    this.activityCentreService.saveState(commandBody).takeUntil(this.isDestroyed$).subscribe(() => { });
  }

  @HostListener('window:scroll', [])
  getScrollYPosition() {
    if (window.scrollY > 500) {
      this.showScrollTop = true;
    } else {
      this.showScrollTop = false;
    }

    this.isPositionFixed = false;
    if (window.scrollY > 260) {
      this.isPositionFixed = true;
    }
  }

  formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, filterObj) {
    this.rootFormGroup = this.formGroupSetup.formBuilder.group<IRoot>({
      T2Filter: ActivityCentreT2FilterComponent.formBuilderGroupSetup(formGroupSetup, filterObj.T2Values),
      T3Filter: ActivityCentreT3FilterComponent.formBuilderGroupSetup(formGroupSetup, filterObj.T3Values)
    });
  }

  getSortItem(field: ISortField) {
    this.globalFilter.SortBy = field.SortField;
    this.globalFilter.SortDirection = field.SortDirection;
    this.sortFields = this.sortFields.map(i => {
      i.isSelected = (this.globalFilter.SortBy === i.SortField && this.globalFilter.SortDirection === i.SortDirection);
      return i;
    });
    this.resetCardList();
    this.getCards();
  }

  getSortFields() {
    const sortFields: Array<ISortField> = [
      {
        SortTitle: this.localizationService.translate(ActivityCentreModuleResourceKeys.sortTitle.TimeInStateNewest),
        SortField: SortFields.TimeInState,
        SortDirection: SortDirection.Desc
      },
      {
        SortTitle: this.localizationService.translate(ActivityCentreModuleResourceKeys.sortTitle.TimeInStateOldest),
        SortField: SortFields.TimeInState,
        SortDirection: SortDirection.Asc
      },
      {
        SortTitle: this.localizationService.translate(ActivityCentreModuleResourceKeys.sortTitle.StartDateNewest),
        SortField: SortFields.StartDate,
        SortDirection: SortDirection.Desc
      },
      {
        SortTitle: this.localizationService.translate(ActivityCentreModuleResourceKeys.sortTitle.StartDateOldest),
        SortField: SortFields.StartDate,
        SortDirection: SortDirection.Asc
      },
      {
        SortTitle: this.localizationService.translate(ActivityCentreModuleResourceKeys.sortTitle.EndDateNewest),
        SortField: SortFields.EndDate,
        SortDirection: SortDirection.Desc
      },
      {
        SortTitle: this.localizationService.translate(ActivityCentreModuleResourceKeys.sortTitle.EndDateOldest),
        SortField: SortFields.EndDate,
        SortDirection: SortDirection.Asc
      }
    ];
    return sortFields;
  }
}
