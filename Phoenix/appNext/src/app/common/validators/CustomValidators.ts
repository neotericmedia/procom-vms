import { AbstractControl, ValidatorFn, FormArray } from '@angular/forms';

export class CustomValidators {
    static required(control: AbstractControl): { [key: string]: any } {
        return control.value === undefined || control.value === null || (control.value.trim() === '') ?
            { 'required': true } :
            null;
    }

    static requiredCharLength(minLengthOfChars: number): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            const res = control.value === undefined || control.value === null || (control.value.trim() === '');
            if (res) {
                return { 'required': true };
            } else {
                return control.value.length < minLengthOfChars ? { 'required': true } : null;
            }
        };
    }

    static requiredAtLeastOne(requiredField: string, message: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {

            const array = control as FormArray;

            for (let index = 0; index < array.length; index++) {
                if (array.at(index).get(requiredField).value === true) {
                    return null;
                }
            }

            return {
                required: {
                    message: message,
                }
            };
        };
    }
}
