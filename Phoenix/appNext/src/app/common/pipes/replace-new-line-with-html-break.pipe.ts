import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceNewLineWithHtmlBreak'
})
export class ReplaceNewLineWithHtmlBreakPipe implements PipeTransform {

  transform(value: string): string {
    const newValue = (value || '').replace(/\r\n/g, '<br/>').replace(/\n\r/g, '<br/>').replace(/\r/g, '<br/>').replace(/\n/g, '<br/>');
    return `${newValue}`;
  }

}
