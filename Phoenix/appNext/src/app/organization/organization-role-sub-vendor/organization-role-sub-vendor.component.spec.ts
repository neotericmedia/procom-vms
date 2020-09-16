import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationRoleSubVendorComponent } from './organization-role-sub-vendor.component';

describe('OrganizationRoleSubVendorComponent', () => {
  let component: OrganizationRoleSubVendorComponent;
  let fixture: ComponentFixture<OrganizationRoleSubVendorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationRoleSubVendorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationRoleSubVendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
