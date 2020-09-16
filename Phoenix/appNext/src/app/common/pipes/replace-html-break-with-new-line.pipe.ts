import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceHtmlBreakWithNewLine'
})
export class ReplaceHtmlBreakWithNewLinePipe implements PipeTransform {

  transform(value: string): string {
    const newValue = (value || '').replace(/<br\s*[\/]?>/gi, '\n').replace(/<[\/]br\s*?>/gi, '\n');
    return `${newValue}`;

  }

}
