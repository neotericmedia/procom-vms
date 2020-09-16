import { Directive, HostListener, ElementRef, OnInit, Input } from '@angular/core';

@Directive({
    selector: '[inputTextLimitWithDecimals]'
})
export class InputTextLimitWithDecimalsDirective implements OnInit {

    @Input('inputTextLimitWithDecimals') filterValues;
    private el: HTMLInputElement;

    constructor(private elementRef: ElementRef) {
        this.el = this.elementRef.nativeElement;
    }

    ngOnInit() {
    }

    @HostListener('blur', ['$event'])
    onBlur(event) {
        if (((event.target.value).split('.').length === 1 || event.target.value === 0) && event.target.value !== '') {
            this.el.value = Number(event.target.value).toFixed(this.filterValues.decimalplaces);
        }
    }

    @HostListener('input', ['$event'])
    onKeyDown(event) {
        // Need to handle decimal place with 0
        const filterValues = this.filterValues;
        const initialValue = this.el.value;
        let valueStr = event.target.value;
        const value = parseFloat(event.target.value);

        const replaceStr = '/\.{' + filterValues.decimalplaces.toString() + ',}/';
        valueStr = initialValue.replace(/[^0-9.]+/g, '').replace(replaceStr, '.');

        if (initialValue !== valueStr) {
            event.stopPropagation();
        }

        const valueArray = valueStr.split('.');

        if (valueArray.length >= 2) {
            valueStr = valueArray[0] + '.' + valueArray[1].slice(0, filterValues.decimalplaces);
        }

        if (valueStr.substr(0, 1) === '.' && valueArray[0] === '') {
            valueStr = filterValues.from + '.' + valueArray[1];
        }

        if ((valueArray[1] || []).length > filterValues.decimalplaces) {
            valueStr = valueArray[0] + '.' + valueArray[1].substr(0, filterValues.decimalplaces);
        }

        if (value < filterValues.from) {
            valueStr = filterValues.from.toString();
        } else if (value > filterValues.to) {
            for (let i = 0; i < valueStr.length; i++) {
                if (parseFloat(valueStr) > filterValues.to) {
                    valueStr = valueArray[0].substr(0, valueStr.length - 1);
                }
            }
        }
        if (valueStr.substr(0, 1) === '0' && valueStr.length > 1) {
            if (valueStr.substr(1, 1) !== '0' && valueStr.substr(1, 1) !== '.') {
                valueStr = valueStr.substr(1, valueStr.length);
            } else if (valueStr.substr(1, 1) === '0') {
                valueStr = valueStr.substr(0, 1);
            }
        }
        this.el.value = valueStr === '' ? null : valueStr;
    }
}
