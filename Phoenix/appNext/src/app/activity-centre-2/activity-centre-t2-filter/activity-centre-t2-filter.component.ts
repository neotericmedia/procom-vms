import { Component, Input, SimpleChanges, OnChanges, HostListener, EventEmitter, Output } from '@angular/core';
import { PhxFormControlLayoutType } from '../../common/model';
import { IFormGroupSetup, IT2Filter, IStatus, IEntityStatus } from '../model';
import { FormGroup, FormArray, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { formGroupOnValueChange$, IFormGroupValue } from '../../common/utility/form-group';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { ISubscription } from 'rxjs/Subscription';
@Component({
  selector: 'app-activity-centre-t2-filter',
  templateUrl: './activity-centre-t2-filter.component.html',
  styleUrls: ['./activity-centre-t2-filter.component.less']
})

export class ActivityCentreT2FilterComponent extends BaseComponentOnDestroy implements OnChanges {

  @Input() formGroup: FormGroup<IT2Filter>;
  @Input() isFilter: boolean = false;
  @Output() t2FilterChanged: EventEmitter<Array<any>> = new EventEmitter<Array<any>>();
  layoutType: PhxFormControlLayoutType = PhxFormControlLayoutType.InputOnly;
  largeScreen: boolean = false;
  isNormalDisplay: boolean = false;
  isMediumDisplay: boolean = false;
  isLargeDisplay: boolean = false;
  isLargeWithFilter: boolean = false;
  isMobileScreen: boolean = false;
  isMobile: boolean = false;
  isHidden: boolean = true;
  isAllItem: boolean = true;
  inputFormGroupChangeSubscription: ISubscription = null;
  formGroupSetup: IFormGroupSetup;

  @HostListener('window:resize', ['$event']) onResize(event) {
    this.isWindowMobileSize(event.target);
  }

  constructor(private formBuilder: FormBuilder) {
    super();
    this.formGroupSetup = { formBuilder: this.formBuilder };
  }

  ngOnChanges(changes: SimpleChanges) {
    const updateFormGroupEmitEvent = () => {
      if (this.inputFormGroupChangeSubscription) {
        this.inputFormGroupChangeSubscription.unsubscribe();
        this.inputFormGroupChangeSubscription = null;
      }
      this.inputFormGroupChangeSubscription = formGroupOnValueChange$<IT2Filter>(this, this.formGroup, []).takeUntil(this.isDestroyed$).debounceTime(500).subscribe((obj: IFormGroupValue) => {
        let activeItem = this.formGroup.value.Statuses.filter(b => b.isActive);
        if ((obj.name === 'AllItem' && obj.val) || this.formGroup.value.Statuses.length === activeItem.length || !activeItem.length) {
          this.formGroup.get('AllItem').patchValue(true, { emitEvent: false, onlySelf: true });
          this.formGroup.get('AllItem').disable({ emitEvent: false, onlySelf: true });
          const formStatusArrayValues = this.formGroup.get('Statuses').value.map((val: IStatus) => {
            val.isActive = false;
            return val;
          });
          this.formGroup.setControl('Statuses', ActivityCentreT2FilterComponent.statusListFormArray(this.formGroupSetup, formStatusArrayValues));
          updateFormGroupEmitEvent();
        } else {
          this.formGroup.get('AllItem').patchValue(false, { emitEvent: false, onlySelf: true });
          this.formGroup.get('AllItem').enable({ emitEvent: false, onlySelf: true });
        }
        activeItem = this.formGroup.value.Statuses.filter(x => x.isActive);
        this.t2FilterChanged.emit(activeItem);
      });
    };
    if (changes.isFilter && changes.isFilter.currentValue) {
      this.isFilter = !!changes.isFilter.currentValue;
    }
    if (changes.formGroup && changes.formGroup.currentValue) {
      this.formGroup = changes.formGroup.currentValue;
      const activeItem = this.formGroup.value.Statuses.filter(b => b.isActive);
      if (!activeItem.length) {
        this.formGroup.get('AllItem').disable({ emitEvent: false, onlySelf: true });
      }
      updateFormGroupEmitEvent();
    }
    this.isWindowMobileSize(window);
    this.checkScreen();
  }

  showMore() {
    this.isHidden = !this.isHidden;
    this.checkScreen();
  }

  isWindowMobileSize(window) {
    this.largeScreen = false;
    this.isMobile = window.innerWidth < 550 || (window.innerWidth >= 1167 && window.innerWidth <= 1304);
    if (window.innerWidth >= 1920) {
      this.largeScreen = true;
    }
  }

  onStatusClicked(index: number, event) {
    event.preventDefault();
    if (index >= 0) {
      const arrayData = this.formGroup.get('Statuses') as FormArray<IStatus>;
      const formGroup = arrayData.at(index) as FormGroup<IStatus>;
      formGroup.get('isActive').setValue(!formGroup.get('isActive').value);
    } else {
      this.formGroup.controls.AllItem.setValue(!this.formGroup.get('AllItem').value);
    }
  }

  checkScreen() {
    this.isNormalDisplay = false;
    this.isMediumDisplay = false;
    this.isLargeDisplay = false;
    this.isLargeWithFilter = false;
    this.isMobileScreen = false;
    if (this.isFilter && this.formGroup.controls.Statuses.value.length && this.formGroup.controls.Statuses.value.length > 5 && this.isHidden && !this.largeScreen && !this.isMobile) {
      this.isNormalDisplay = true;
    } else if (this.formGroup.controls.Statuses.value.length && this.formGroup.controls.Statuses.value.length > 9 && this.isHidden && !this.largeScreen && !this.isMobile) {
      this.isMediumDisplay = true;
    } else if (this.largeScreen && this.formGroup.controls.Statuses.value.length && this.formGroup.controls.Statuses.value.length > 11 && this.isHidden && !this.isFilter) {
      this.isLargeDisplay = true;
    } else if (this.isFilter && this.formGroup.controls.Statuses.value.length && this.formGroup.controls.Statuses.value.length > 9 && this.largeScreen && this.isHidden) {
      this.isLargeWithFilter = true;
    } else if (this.isFilter && this.formGroup.controls.Statuses.value.length && this.formGroup.controls.Statuses.value.length > 4 && this.isHidden && !this.largeScreen && this.isMobile) {
      this.isMobileScreen = true;
    }
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, t2FilterStatuses: IT2Filter): FormGroup<IT2Filter> {
    const formGroup = formGroupSetup.formBuilder.group<IT2Filter>({
      AllItem: [t2FilterStatuses.AllItem],
      Count: [t2FilterStatuses.Count],
      Statuses: ActivityCentreT2FilterComponent.statusListFormArray(formGroupSetup, t2FilterStatuses.Statuses)
    });
    return formGroup;
  }

  public static statusListFormArray(formGroupSetup: IFormGroupSetup, t2FilterStatuses: Array<IStatus>): FormArray<IStatus> {
    const formArray = formGroupSetup.formBuilder.array<IStatus>(t2FilterStatuses.map((item: IStatus, index) => {
      return formGroupSetup.formBuilder.group<IStatus>({
        Count: [item.Count],
        DisplayName: [item.DisplayName],
        isActive: [item.isActive],
        GroupKey: [item.GroupKey],
        EntityStatusMapping: ActivityCentreT2FilterComponent.entityStatusMappingFormArray(formGroupSetup, item.EntityStatusMapping)
      });
    })
    );
    return formArray;
  }

  public static entityStatusMappingFormArray(formGroupSetup: IFormGroupSetup, entityStatusMapping: Array<IEntityStatus> = []): FormArray<IEntityStatus> {
    const formArray = formGroupSetup.formBuilder.array<IEntityStatus>(entityStatusMapping.map((item: IEntityStatus) => {
      return formGroupSetup.formBuilder.group<IEntityStatus>({
        Count: [item.Count],
        EntityStatusId: [item.EntityStatusId],
        EntityTypeId: [item.EntityTypeId]
      });
    })
    );
    return formArray;
  }
}
