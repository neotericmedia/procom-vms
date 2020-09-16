import { Pipe, PipeTransform } from '@angular/core';
import { LookupNoCachePipe } from './lookup-no-cache.pipe';

// Pure pipes
// Angular executes a pure pipe only when it detects a pure change to the input value.
//  A pure change is either a change to a primitive input value (String, Number, Boolean, Symbol)
//   or a changed object reference (Date, Array, Function, Object).

// Angular ignores changes within (composite) objects. It won't call a pure pipe if you change
//  an input month, add to an input array, or update an input object property.

@Pipe({
  name: 'lookupNoCacheImpure',
  pure: false
})

export class LookupNoCachePipeImpure extends LookupNoCachePipe implements PipeTransform {
  transform() {
    return true;
  }
}
