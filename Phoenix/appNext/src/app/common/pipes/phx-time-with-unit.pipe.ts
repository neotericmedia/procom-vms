import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeWithUnit'
})

export class PhxTimeWithUnit implements PipeTransform {

    constructor() { }

    transform(minutes: number, showDecimals: boolean = false, showUnits: boolean = true, acronymForUnits: boolean = true): string {
        let unitValue: number = minutes;
        let unitType: string;
        let result: string;
        let shortUnitType: string;

        if (minutes === 1) {
            unitValue = 1;
            unitType = 'minute';
            shortUnitType = 'm';
        } else if (minutes < 60) {
            unitType = 'minutes';
            shortUnitType = 'm';
        } else if (minutes >= 60 && minutes < 120) {
            unitValue = 1;
            unitType = 'hour';
            shortUnitType = 'h';
        } else if (minutes < 1440) {
            unitValue = minutes / 60;
            unitType = 'hours';
            shortUnitType = 'h';
        } else if (minutes >= 1440 && minutes < 2880) {
            unitValue = 1;
            unitType = 'day';
            shortUnitType = 'd';
        } else {
            unitValue = minutes / 1440;
            unitType = 'days';
            shortUnitType = 'd';
        }

        result = unitValue.toFixed(2);

        if (!showDecimals) {
            result = Math.floor(unitValue) + '';
        }

        if (showUnits) {
            result += (acronymForUnits ? shortUnitType : unitType).toLowerCase();
            // result += ' ' + this.localService.translate('common.generic.' + (acronymForUnits ? unitType + 'Short' : unitType)).toLowerCase();
        }

        return result;
    }

}
