import { Injectable } from '@angular/core';

@Injectable()
export class ValidationService {
    static getValidatorErrorMessage(label: string, validatorName: string, validatorValue?: any) {
        let config = {
            'required': ((label != '') ? label + ' is required' : 'Field is required'),
            'invalidEmailAddress': 'Enter valid email address',
            'invalidPassword': 'Enter valid password. Password must be at least 6 characters long, and contain a number.',
            'invalidConfirmPassword': 'Password does not match.',
            'invalidAlphabet': 'Enter only alphabet character in ' + label,
            'invalidNumber': 'Enter only numbers in ' + label,
            'pattern': label + ' is incorrect',
            'invalidDuplicate': label + ' already exists.',
            'invalidItem': 'invalid item',
            'minlength': `Minimum length ${validatorValue.requiredLength}`,
            'maxlength': `Maximun length ${validatorValue.requiredLength}`,
            'invalidDate': ((label != '') ? label + ' is invalid' : 'Date is invalid'),
            'invalidConversion':label,
            'invalidDiscount':label
        };
        return config[validatorName];
    }
    
    static validateDate(control) {
        if (control.hasError('required') || (ValidationService.isBlank(control.value) || (ValidationService.isString(control.value) && control.value.trim() == ""))) {
            return null;
        }
        if (/^\d{2}[./-]\d{2}[./-]\d{4}$/.test(control.value)) {
            return null;
        }
        return { 'invalidDate': true };
    }

    static emailValidator(control) {
        // RFC 2822 compliant regex
        if (control.hasError('required') || (ValidationService.isBlank(control.value) || (ValidationService.isString(control.value) && control.value.trim() == ""))) {
            return null;
        }
        if (control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
            return null;
        }
        return { 'invalidEmailAddress': true };

    }

    static mobileValidator(control) {
        let mobFormat = /^(\+?\d{1,3}[- ]?)?\d{10}$/;
        if(mobFormat.test(control.value)){
            return null;
        }
        return { 'invalidMobileNumber': true };
    }

    static customRequired(control) {
        return (ValidationService.isBlank(control.value) || ((ValidationService.isString(control.value) && control.value.trim() == "") || control.value==0) ?
            { "required": true } :
            null);
    }

    static isBlank(value) {
        return (typeof value == 'undefined' || !value) ? true : false;
    }

    static isString(value) {
        return (typeof value == 'string') ? true : false;
    }

    static passwordValidator(control) {
        // {6,100}           - Assert password is between 6 and 100 characters
        // (?=.*[0-9])       - Assert a string has at least one number
        if (control.value.match(/^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{6,100}$/)) {
            return null;
        }
        return { 'invalidPassword': true };

    }

    static hasWhiteSpace(control){
        if(/^\s*$/.test(control.value) == false){
            return null;
        }
        return { 'required': true };
    }

    static allowAlphabet(control) {
        // if (control.hasError('required') || (ValidationService.isBlank(control.value) || (ValidationService.isString(control.value) && control.value.trim() == ""))) {
        //     return null;
        // }
        // console.log(control.value);
        if (/^[A-Za-z ]+$/.test(control.value)) {
            return null;
        }
        return { 'required': true };
    }

    static allowNumeric(control) {
        if (control.hasError('required') || (ValidationService.isBlank(control.value) || (ValidationService.isString(control.value) && control.value.trim() == ""))) {
            return null;
        }
        if (/^[0-9]+$/.test(control.value)) {
            return null;
        }
        return { 'invalidNumber': true };

    }

    static confirmPassValidator(control) {
        if (control.hasError('required')) {
            return null;
        }
        let form = control.root;
        if (!ValidationService.isBlank(form) && !ValidationService.isBlank(form.controls) && form.controls.hasOwnProperty('password')) {
            if (form.controls['password'].value == "" || form.controls['password'].value == control.value) {
                return null;
            }
        }
        return { 'invalidConfirmPassword': true };
    }

    static resetForm(form) {
        for (var name in form.controls) {
            // ValidationService.form.controls[name].updateValue('');
            form.controls[name].setErrors(null);
        }
    }

    static validateForm(form, notCheck: string[] = []) {
        for (var name in form.controls) {
            //if(!(notCheck && notCheck.indexOf(name) !== -1)){
            form.controls[name].updateValueAndValidity();
            form.controls[name].markAsTouched();
            //}
        }

        return form.valid;
    }
}