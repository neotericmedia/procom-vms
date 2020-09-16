import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'boolToYesNo'
})
export class BoolToYesNoPipe implements PipeTransform {

  transform(value?: boolean): string {
    return (value !== undefined && value !== null)  ? ( value === true ? 'Yes' : 'No' ) : 'Not Specified';
  }

}
