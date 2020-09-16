import { Injectable } from '@angular/core';
import { ApiService } from '../common';

@Injectable()
export class AdminService {
  constructor(private apiService: ApiService) {}

  forceInvalidateCodeCache() {
    return this.apiService.command('ForceInvalidateCodeCache');
  }
  forceInvalidateWorkflowCache() {
    return this.apiService.command('ForceInvalidateWorkflowCache');
  }
}
