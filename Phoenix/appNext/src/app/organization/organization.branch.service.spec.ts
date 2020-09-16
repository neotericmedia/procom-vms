/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { OrganizationBranchService } from './organization.branch.service';

describe('Service: OrganizationBranch', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrganizationBranchService]
    });
  });

  it('should ...', inject([OrganizationBranchService], (service: OrganizationBranchService) => {
    expect(service).toBeTruthy();
  }));
});
