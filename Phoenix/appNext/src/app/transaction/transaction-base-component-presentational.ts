// angular
import { ISubscription } from 'rxjs/Subscription';
import { OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
// common
import { FormGroup, FormArray, FormBuilder } from '../common/ngx-strongly-typed-forms/model';
import { CommonService, PhxConstants, CodeValueService, CustomFieldService } from '../common';
import { AccessAction } from '../common/model/access-action';
import { BaseComponentOnDestroy } from '../common/state/epics/base-component-on-destroy';
import { CommonListsObservableService } from '../common/lists/lists.observable.service';
import { formGroupOnValueChange$, IFormGroupValue } from '../common/utility/form-group';

// import { IReadOnlyStorage } from './state/workorder.interface';
import { TransactionApiServiceLocator } from './transaction.api.service.locator';

export abstract class TransactionBaseComponentPresentational<T> extends BaseComponentOnDestroy implements OnChanges {
  @Input() readOnlyStorage: any;
  @Input() inputFormGroup: FormGroup<T>;
  inputFormGroupChangeSubscription: ISubscription = null;

  public codeValueService: CodeValueService;
  public commonService: CommonService;
  public commonListsObservableService: CommonListsObservableService;
  public customFieldService: CustomFieldService;

  public formBuilder: FormBuilder;

  public codeValueGroups: any = null;
  public phxConstants: typeof PhxConstants = null;

  public constructorName: string;
  public excludedFields: string[] = [];

  constructor(constructorName: string) {
    super();
    this.constructorName = constructorName;
    
    this.commonListsObservableService = TransactionApiServiceLocator.injector.get<CommonListsObservableService>(CommonListsObservableService, null);
    this.codeValueService = TransactionApiServiceLocator.injector.get<CodeValueService>(CodeValueService, null);
    this.commonService = TransactionApiServiceLocator.injector.get<CommonService>(CommonService, null);
    this.customFieldService = TransactionApiServiceLocator.injector.get<CustomFieldService>(CustomFieldService, null);
    this.formBuilder = TransactionApiServiceLocator.injector.get<FormBuilder>(FormBuilder, null);

    this.phxConstants = PhxConstants;
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(this.constructor.name + ' ngOnChanges.');
    // debugger;
    if (changes.readOnlyStorage) {
      // this.recalcAccessActions(this.readOnlyStorage.IsEditable, this.readOnlyStorage.AccessActions);
    }

    if (changes.inputFormGroup) {
      if (this.inputFormGroupChangeSubscription) {
        this.inputFormGroupChangeSubscription.unsubscribe();
        this.inputFormGroupChangeSubscription = null;
      }
      const formGroup: FormGroup<T> = changes.inputFormGroup.currentValue;
      this.inputFormGroupChangeSubscription = formGroupOnValueChange$<T>(this, formGroup, this.excludedFields).subscribe((obj: IFormGroupValue) => {
        console.log('{ name: ' + obj.name + ', value:' + obj.val + '}');
        this.businessRules(obj);
        this.outputEvent.emit();
        // this.recalcLocalProperties(formGroup);
      });
    }
    this.additionalOnchanges(changes);
  }

  public patchValue<U>(inputFormGroup: FormGroup<U>, value: Partial<U>) {
    inputFormGroup.patchValue(value, { emitEvent: false });
    // inputFormGroup.setValue(value, { emitEvent: false });
  }


  // public abstract getCodeValuelistsStatic();

  // public abstract recalcAccessActions(isEditable: boolean, accessActions: Array<AccessAction>);

  // public abstract recalcLocalProperties(inputFormGroup: FormGroup<T>);

  public abstract businessRules(obj: IFormGroupValue): void;
  public abstract additionalOnchanges(changes: SimpleChanges): void;

  public getRootFormGroup(currentFormGroup: FormGroup<T>): FormGroup<T> | FormArray<T> {
    const getRoot = (formGroup: FormGroup<T> | FormArray<T>): FormGroup<T> | FormArray<T> => {
      if (formGroup.parent) {
        return getRoot(formGroup.parent);
      } else {
        return formGroup;
      }
    };
    return getRoot(currentFormGroup);
  }
}
