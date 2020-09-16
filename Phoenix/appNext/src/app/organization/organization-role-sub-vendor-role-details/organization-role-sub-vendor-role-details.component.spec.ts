import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationRoleSubVendorRoleDetailsComponent } from './organization-role-sub-vendor-role-details.component';

describe('OrganizationRoleSubVendorRoleDetailsComponent', () => {
  let component: OrganizationRoleSubVendorRoleDetailsComponent;
  let fixture: ComponentFixture<OrganizationRoleSubVendorRoleDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationRoleSubVendorRoleDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationRoleSubVendorRoleDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
