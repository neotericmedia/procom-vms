import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'phxDisplayCurrency'
})

export class PhxDisplayCurrency implements PipeTransform {
    transform(value) {
        if (value != null && value !== undefined) {
            const formattedValue = '$' + parseFloat(value).toFixed(2).toString();
            return formattedValue;
        } else {
            return '';
        }
    }
}
