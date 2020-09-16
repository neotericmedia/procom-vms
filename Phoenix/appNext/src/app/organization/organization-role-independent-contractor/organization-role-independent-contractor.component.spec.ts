import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationRoleIndependentContractorComponent } from './organization-role-independent-contractor.component';

describe('OrganizationRoleIndependentContractorComponent', () => {
  let component: OrganizationRoleIndependentContractorComponent;
  let fixture: ComponentFixture<OrganizationRoleIndependentContractorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationRoleIndependentContractorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationRoleIndependentContractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
