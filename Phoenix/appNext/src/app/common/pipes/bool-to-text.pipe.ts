import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'boolToText'
})
export class BoolToTextPipe implements PipeTransform {

  transform(value?: boolean, trueValueText?: string, falseValueText?: string, defaultText?: string): string {
    return (value !== undefined && value !== null) ?
      (value === true ? trueValueText ? trueValueText : 'Yes' :
        falseValueText ? falseValueText : 'No') :
      defaultText ? defaultText : 'Not Specified';
  }

}
