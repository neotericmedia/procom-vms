import { AbstractControl } from '@angular/forms';

export class FormControlExtensions {
    static findControlName(control: AbstractControl): string {
        if (control && control.parent) {
            const parentControls = control.parent.controls;
            for (const controlName in parentControls) {
                if (parentControls.hasOwnProperty(controlName) && parentControls[controlName] === control) {
                    return controlName;
                }
            }
        }
        return null;
    }

    static hasRequiredField(abstractControl: AbstractControl): boolean {
        if (abstractControl == null) {
            return false;
        }
        if (abstractControl.validator) {
            const validator = abstractControl.validator({} as AbstractControl);
            if (validator && validator.required) {
                return true;
            }
        }
        if (abstractControl['controls']) {
            for (const controlName in abstractControl['controls']) {
                if (abstractControl['controls'][controlName]) {
                    if (FormControlExtensions.hasRequiredField(abstractControl['controls'][controlName])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
