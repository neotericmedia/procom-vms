import { Component, Output, EventEmitter, ViewChild, OnChanges, Input, SimpleChanges, OnInit } from '@angular/core';
import { ActivityCentreService } from '../shared/activity-centre.service';
import { ActivatedRoute } from '@angular/router';
import { PhxConstants } from '../../common/model/phx-constants';
import { PhxFormControlLayoutType } from '../../common/model';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
import { CodeValueService, CommonService } from '../../common/index';
import { cloneDeep, groupBy, sumBy, flatMap, map } from 'lodash';
import { TaskType, IT3Filter, IFormGroupSetup, IEntityItems, IStatus, ISearchStatus } from '../model';
import { FormGroup, FormArray, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { formGroupOnValueChange$, IFormGroupValue } from '../../common/utility/form-group';
import { ISubscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-activity-centre-t3-filter',
  templateUrl: './activity-centre-t3-filter.component.html',
  styleUrls: ['./activity-centre-t3-filter.component.less']
})

export class ActivityCentreT3FilterComponent extends BaseComponentOnDestroy implements OnChanges, OnInit {
  @Input() formGroup: FormGroup<IT3Filter>;
  @Input() t1Status: any;
  @Input() isClientListVisible: boolean;
  @Output() canShowFilter = new EventEmitter<boolean>();
  @Output() t3FilterChanged = new EventEmitter<any>();
  @ViewChild('SaveT3FilterModal') SaveT3FilterModal: PhxModalComponent;
  @ViewChild('DeleteT3StateModal') DeleteT3StateModal: PhxModalComponent;

  phxConstants: any;
  clientList: Array<any> = [];
  taskOwnerList: Array<any> = [];
  savedT3FilterStateList: Array<any> = [];
  layoutType: any;
  codeValueGroup: any = {};
  entityCodeList: any;
  taskData: any;
  totalEntityCount: number = 0;
  formGroupSetup: IFormGroupSetup;
  inputFormGroupChangeSubscription: ISubscription = null;
  componentName: string = 'Activity-Center-T3-Component';
  showToolTip: boolean = false;
  filterForDeletion: ISearchStatus;
  showapplyFilter: boolean = false;

  constructor(protected activatedRoute: ActivatedRoute,
    protected activityCentreService: ActivityCentreService,
    private codeValueService: CodeValueService,
    private formBuilder: FormBuilder,
    private commonService: CommonService) {
    super();
    this.phxConstants = PhxConstants;
    this.layoutType = PhxFormControlLayoutType;
    this.codeValueGroup = this.commonService.CodeValueGroups;
    this.taskData = TaskType;
    this.formGroupSetup = { formBuilder: this.formBuilder };
    this.getClientList();
    this.getTaskOwnerList();
    this.getEntityCodeList();
  }

  ngOnChanges(changes: SimpleChanges) {
    const updateFormGroupEmitEvent = () => {
      if (this.inputFormGroupChangeSubscription) {
        this.inputFormGroupChangeSubscription.unsubscribe();
        this.inputFormGroupChangeSubscription = null;
      }
      this.inputFormGroupChangeSubscription = formGroupOnValueChange$<IT3Filter>(this, this.formGroup, ['FilterName']).takeUntil(this.isDestroyed$).debounceTime(300).subscribe((obj: IFormGroupValue) => {
        this.showapplyFilter = window.innerWidth <= 1200 ? true : false;
        const activeItem = this.formGroup.value.EntityItems.filter(b => b.FilterSelected);
        if ((obj.name === 'AllEntities' && obj.val) || this.formGroup.value.EntityItems.length === activeItem.length || !activeItem.length) {
          this.formGroup.get('AllEntities').patchValue(true, { emitEvent: false, onlySelf: true });
          this.formGroup.get('AllEntities').disable({ emitEvent: false, onlySelf: true });
          const formStatusArrayValues = this.formGroup.get('EntityItems').value.map((val: IEntityItems) => {
            val.FilterSelected = false;
            return val;
          });
          this.formGroup.setControl('EntityItems', ActivityCentreT3FilterComponent.entityFormArray(this.formGroupSetup, formStatusArrayValues));
          updateFormGroupEmitEvent();
        } else {
          this.formGroup.get('AllEntities').patchValue(false, { emitEvent: false, onlySelf: true });
          this.formGroup.get('AllEntities').enable({ emitEvent: false, onlySelf: true });
        }
        if (!this.showapplyFilter) {
          this.applyFilter();
        }
      });
    };
    if (changes.formGroup && changes.formGroup.currentValue) {
      this.formGroup = changes.formGroup.currentValue;
      const activeItem = this.formGroup.value.EntityItems.filter(b => b.FilterSelected);
      this.checkEntityCountReduntant();
      if (!activeItem.length) {
        this.formGroup.get('AllEntities').patchValue(true, { emitEvent: false, onlySelf: true });
        this.formGroup.get('AllEntities').disable({ emitEvent: false, onlySelf: true });
      }
      updateFormGroupEmitEvent();
      this.totalEntityCount = sumBy(this.formGroup.value.EntityItems, 'Count') || 0;
    }
    if (changes.t1Status && changes.t1Status.currentValue) {
      this.t1Status = changes.t1Status.currentValue;
    }
  }

  ngOnInit() {
    this.getAllSavedT3SearchStatuses();
  }

  closeFilter() {
    this.canShowFilter.emit(false);
  }

  getEntityCodeList() {
    this.entityCodeList = this.codeValueService.getCodeValues(this.codeValueGroup.EntityType, true);
  }

  cancelModal() {
    this.SaveT3FilterModal.hide();
  }

  saveSearch() {
    this.SaveT3FilterModal.show();
  }

  applyFilter() {
    const formValues = cloneDeep(this.formGroup.value);
    formValues.EntityItems = formValues.EntityItems.filter(a => a.FilterSelected);
    this.t3FilterChanged.emit(formValues);
  }

  applyFilterButton() {
    this.applyFilter();
    this.closeFilter();
  }

  getClientList() {
    this.activityCentreService
      .getClients()
      .takeUntil(this.isDestroyed$)
      .subscribe((client: any) => {
        this.clientList = client;
      });
  }

  getTaskOwnerList() {
    this.activityCentreService
      .getTaskOwners()
      .takeUntil(this.isDestroyed$)
      .subscribe((taskowner: any) => {
        this.taskOwnerList = taskowner;
      });
  }

  checkEntityCountReduntant() {
    const array = <FormArray<IEntityItems>>this.formGroup.get('EntityItems');
    for (let index = 0; index < array.length; index++) {
      if (array.at(index).get('Count').value === 0) {
        const formGroup = array.at(index) as FormGroup<IEntityItems>;
        formGroup.get('FilterSelected').patchValue(false);
      }
    }
  }

  resetFilters() {
    this.formGroup.patchValue({
      AllEntities: true,
      KeyWord: null,
      EndDate: null,
      StartDate: null,
      Client: null,
      TaskOwner: null,
      FilterName: null
    });
    const entityTypes = this.formGroup.value.EntityItems;
    entityTypes.forEach((data, i) => {
      const formArray = <FormArray<IEntityItems>>this.formGroup.get('EntityItems');
      const formGroup = formArray.at(i) as FormGroup<IEntityItems>;
      formGroup.get('FilterSelected').patchValue(false);
    });
  }

  getAllSavedT3SearchStatuses(isFirstItem?: boolean) {
    this.activityCentreService.getStates(this.componentName).takeUntil(this.isDestroyed$).subscribe((statusList: any) => {
      this.savedT3FilterStateList = statusList.Items;
      this.savedT3FilterStateList.map(a => a.filterSelected = false);
      if (this.formGroup.value.FilterName) {
        const selectedFilter = this.savedT3FilterStateList.find(x => x.StateName === this.formGroup.value.FilterName);
        if (selectedFilter) {
          selectedFilter.filterSelected = true;
        }
      }
      this.showToolTip = this.savedT3FilterStateList.length === 1 && isFirstItem ? true : false;
    });
  }

  saveT3FilterState() {
    const commandBody = {
      Id: 0,
      LastModifiedDatetime: new Date(Date.now()),
      ComponentName: this.componentName,
      StateName: this.formGroup.value.FilterName,
      State: this.formGroup.value,
      StateDescription: null
    };
    const isFirstItem = this.savedT3FilterStateList.length ? false : true;
    this.activityCentreService.saveState(commandBody, true).takeUntil(this.isDestroyed$).subscribe(() => {
      this.getAllSavedT3SearchStatuses(isFirstItem);
      this.SaveT3FilterModal.hide();
    });
  }

  getSavedT3FilterState(filteredItem: any) {
    this.activityCentreService.getState(this.componentName, filteredItem.StateName).takeUntil(this.isDestroyed$).subscribe((result: any) => {
      const stateDetails = JSON.parse(result.Items[0].State);
      this.formGroup.patchValue({
        StartDate: stateDetails.StartDate ? stateDetails.StartDate : null,
        Client: stateDetails.Client,
        EndDate: stateDetails.EndDate ? stateDetails.EndDate : null,
        TaskOwner: stateDetails.TaskOwner,
        FilterName: result.Items[0].StateName
      });
      const formArray = <FormArray<IEntityItems>>this.formGroup.get('EntityItems');
      stateDetails.EntityItems.forEach((item, i) => {
        const formGroup = formArray.at(i) as FormGroup<IEntityItems>;
        if (formGroup) {
          formGroup.get('FilterSelected').patchValue(item.FilterSelected);
        }
      });
      this.checkEntityCountReduntant();
    });
    this.savedT3FilterStateList.map(a => a.filterSelected = false);
    filteredItem.filterSelected = true;
  }

  deleteSavedT3FilterState(filteredItem: ISearchStatus) {
    this.filterForDeletion = filteredItem;
    this.DeleteT3StateModal.show();
  }

  deleteT3State() {
    this.activityCentreService.removeState(this.filterForDeletion).takeUntil(this.isDestroyed$).subscribe(() => {
      this.getAllSavedT3SearchStatuses();
      this.resetFilters();
      this.DeleteT3StateModal.hide();
    });
  }

  hideFilterDeleteModal() {
    this.DeleteT3StateModal.hide();
  }

  public static findFilterCount(formGroup: FormGroup<IT3Filter>) {
    let validLength = 0;
    for (const name in formGroup.controls) {
      if (formGroup.controls[name].value && formGroup.controls[name].value instanceof Array) {
        validLength = formGroup.controls[name].value.length && name === 'Client' ? validLength + formGroup.controls[name].value.length : validLength;
        validLength = formGroup.controls[name].value.length && name === 'EntityItems' ? validLength + formGroup.controls[name].value.filter(x => x.FilterSelected).length : validLength;
      } else if (name !== 'AllEntities' && name !== 'FilterName') {
        validLength = formGroup.controls[name].value ? validLength + 1 : validLength;
      }
    }
    return validLength;
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, t3Values: IT3Filter): FormGroup<IT3Filter> {
    const formGroup = formGroupSetup.formBuilder.group<IT3Filter>({
      AllEntities: [t3Values.AllEntities],
      KeyWord: [t3Values.KeyWord],
      StartDate: [t3Values.StartDate],
      EndDate: [t3Values.EndDate],
      Client: [t3Values.Client],
      TaskOwner: [t3Values.TaskOwner],
      FilterName: [t3Values.FilterName],
      EntityItems: this.entityFormArray(formGroupSetup, t3Values.EntityItems)
    });
    return formGroup;
  }

  public static entityFormArray(formGroupSetup: IFormGroupSetup, entityItems: Array<IEntityItems>): FormArray<IEntityItems> {
    const formArray = formGroupSetup.formBuilder.array<IEntityItems>(
      entityItems.map((item: IEntityItems) => {
        return formGroupSetup.formBuilder.group<IEntityItems>({
          EntityTypeId: [item.EntityTypeId],
          Count: [item.Count],
          FilterSelected: [item.FilterSelected]
        });
      })
    );
    return formArray;
  }

  public static filterEntities(statuses: IStatus[]) {
    const entityStatuses = flatMap(statuses, (status: IStatus) => status.EntityStatusMapping);
    const data = groupBy(entityStatuses, 'EntityTypeId');
    return map(Object.keys(data), (key) => {
      return {
        EntityTypeId: +key,
        Count: sumBy(data[key], 'Count'),
        FilterSelected: false
      };
    });
  }
}
