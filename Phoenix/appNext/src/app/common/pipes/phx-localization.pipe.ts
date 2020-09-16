import { Pipe, PipeTransform } from '@angular/core';
import { PhxLocalizationService } from '../services/phx-localization.service';

@Pipe({
  name: 'phxTranslate',
  pure: true
})
export class PhxLocalizationPipe implements PipeTransform {

  constructor(private localService: PhxLocalizationService) { }

  transform(value: string, ...args: any[]): any {
    let result = '';
    if (value) {
        result = this.localService.translate(value, ...args);
    }
    return result;
  }

}
