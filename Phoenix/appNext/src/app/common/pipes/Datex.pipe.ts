/* 
* Custom date pipe for IE and Safari compatibility
* https://angular.io/docs/ts/latest/api/common/index/DatePipe-pipe.html
* - "this pipe uses the Internationalization API. Therefore it is only reliable in Chrome and Opera browsers."
* https://stackoverflow.com/a/40160501 
*/
import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'date' // TODO: remove this after Angular 4 fixes the date pipe + intl
})

export class DatexPipe implements PipeTransform {
    transform(value: any, format: string = ""): string {
        format = this.formatAngularToMoment(format);

        // Try and parse the passed value.
        var momentDate = moment(value);

        // If moment didn't understand the value, return it unformatted.
        if (!momentDate.isValid()) return value;

        // Otherwise, return the date formatted as requested.
        return momentDate.format(format);
    }

    formatAngularToMoment(format: string): string {
        return format
            .replace(/d/g, 'D')
            .replace(/E/g, 'd')
            .replace(/y/g, 'Y')
            .replace(/j/g, 'H');
    }
}