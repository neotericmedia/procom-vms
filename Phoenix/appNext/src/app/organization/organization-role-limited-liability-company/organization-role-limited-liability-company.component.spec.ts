import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationRoleLimitedLiabilityCompanyComponent } from './organization-role-limited-liability-company.component';

describe('OrganizationRoleLimitedLiabilityCompanyComponent', () => {
  let component: OrganizationRoleLimitedLiabilityCompanyComponent;
  let fixture: ComponentFixture<OrganizationRoleLimitedLiabilityCompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationRoleLimitedLiabilityCompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationRoleLimitedLiabilityCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
