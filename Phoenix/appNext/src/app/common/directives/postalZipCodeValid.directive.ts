import { Directive, HostListener, ElementRef, OnInit, Input } from '@angular/core';
import { NgControl } from '@angular/forms';
import { PhxConstants } from './../../common/model/phx-constants';

@Directive({
    selector: '[phxPostalZipCodeValid]'
})
export class PostalZipCodeValidDirective implements OnInit {

    private el: HTMLInputElement;
    @Input('phxPostalZipCodeValid') phxPostalZipCodeValid: string;
    options: any = {
        countryId: 0,
        isRequired: false
    };

    constructor(private elementRef: ElementRef, private control: NgControl) {
        this.el = this.elementRef.nativeElement;
    }

    ngOnInit() {
    }

    @HostListener('blur', ['$event'])
    onblur() {
        const valid = this.addressIsZipPostalIsValid(this.options.countryId, this.options.isRequired, this.el.value);
        if (!valid) {
            this.control.control.setValue(null);
        }
    }

    @HostListener('click', ['$event'])
    onClick() {
        this.cursorFocus();
    }

    @HostListener('input', ['$event'])
    onkeydown() {
        if (this.options.countryId !== PhxConstants.Country.DE) {
            this.convertToUpperCase();
        }
        this.control.control.setValue(this.el.value);
        this.cursorFocus();
        this.options = JSON.parse(this.phxPostalZipCodeValid);
        this.setValidationClass(this.addressIsZipPostalIsValid(this.options.countryId, this.options.isRequired, this.el.value));
    }

    setValidationClass(isValid) {
        if (isValid) {
            if (this.el.classList.contains('ng-invalid')) {
                this.el.classList.remove('ng-invalid');
            }
            if (!this.el.classList.contains('ng-valid')) {
                this.el.classList.add('ng-valid');
            }
        } else {
            this.makeControlAsInvalid();
            if (this.el.classList.contains('ng-valid')) {
                this.el.classList.remove('ng-valid');
            }
            if (!this.el.classList.contains('ng-invalid')) {
                this.el.classList.add('ng-invalid');
            }
        }
    }

    addressIsZipPostalIsValid(countryId, isRequired, postalZipCode) {
        if (!countryId || !isRequired) {
            return true;
        } else if (countryId === PhxConstants.Country.CA) {
            if (PhxConstants.Regex.CountryCanadaPostalCode.test(postalZipCode)) {
                return true;
            } else {
                this.makeControlAsInvalid();
                return false;
            }
        } else if (countryId === PhxConstants.Country.US) {
            if (PhxConstants.Regex.CountryUsaPostalCode.test(postalZipCode)) {
                return true;
            } else {
                this.makeControlAsInvalid();
                return false;
            }
        } else if (countryId === PhxConstants.Country.MX) {
            return !!PhxConstants.Regex.CountryMexicoPostalCode.test(postalZipCode);
        } else if (countryId === PhxConstants.Country.DE) {
            return !!PhxConstants.Regex.CountryGermanyPostalCode.test(postalZipCode);
        } else {
            return true;
        }
    }
    cursorFocus() {
        let len: any = this.el.value.replace(/_/g, '');
        len = len ? len.length : 1;
        this.el.setSelectionRange(len, len);
        this.el.focus();
    }
    makeControlAsInvalid() {
        this.control.control.setErrors({
            notValid: 'Please enter valid postcode.'
        });
    }
    convertToUpperCase() {
        this.el.value = this.el.value ? this.el.value.toUpperCase() : null;
    }

}
