import { Observable } from 'rxjs/Observable';
import { BaseComponentOnDestroy } from '../state/epics/base-component-on-destroy';
import { FormGroup } from '../ngx-strongly-typed-forms/model';

export interface IFormGroupValue {
  name: string;
  val: any;
}

export const formGroupOnValueChange$ = <T>(component: BaseComponentOnDestroy, formGroup: FormGroup<T>, excludedFields: string[] = []): Observable<IFormGroupValue> => {
  const keys = Object.keys(formGroup.controls);
  return Observable.merge(...keys.filter(key => excludedFields.indexOf(key) === -1).map(key => formGroup.controls[key].valueChanges.distinctUntilChanged().map(val => ({ name: key, val }))))
    .do(() => {})
    .debounceTime(300)
    .takeUntil(component.isDestroyed$);
};

