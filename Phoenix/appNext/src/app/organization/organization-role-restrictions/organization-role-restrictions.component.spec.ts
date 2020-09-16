import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationRoleRestrictionsComponent } from './organization-role-restrictions.component';

describe('OrganizationRoleRestrictionsComponent', () => {
  let component: OrganizationRoleRestrictionsComponent;
  let fixture: ComponentFixture<OrganizationRoleRestrictionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationRoleRestrictionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationRoleRestrictionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
