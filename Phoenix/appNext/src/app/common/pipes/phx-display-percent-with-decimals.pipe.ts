import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'phxPercentWithDecimals'
})

export class PhxDisplayPercentWithDecimalsPipe implements PipeTransform {
    transform(value) {
        if (value != null && value !== undefined) {
            const formattedValue = parseFloat(value).toFixed(4).toString()  + '%';
            return formattedValue;
        } else {
            return '';
        }
    }
}
