import { CodeValueService } from './../services/code-value.service';
import { Pipe, PipeTransform, Inject } from '@angular/core';

@Pipe({
  name: 'CodeValue'
})
export class CodeValuePipe implements PipeTransform {

  constructor(
    private codeValueService: CodeValueService
  ) { }

  transform(value: number, groupName: string, displayfield: string = 'text'): string {
    const retVal = this.codeValueService.getCodeValue(value, groupName);
    return retVal && retVal[displayfield];
  }
}
