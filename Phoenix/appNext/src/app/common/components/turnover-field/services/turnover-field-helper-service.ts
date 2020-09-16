import { Injectable } from '@angular/core';

@Injectable()
export class TurnoverFieldHelperService {
  private applicationConstants: any = null;

  postTFConstants(applicationConstants: any): void {
    this.applicationConstants = applicationConstants;
  }

  getTFConstants(): any {
    return this.applicationConstants;
  }

  // getTFConstantsInnerConstants(): any {
  //   const keys = Object.keys(this.applicationConstants);
  //   return this.applicationConstants[keys[0]];
  // }
}