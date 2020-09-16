import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationRoleInternalComponent } from './organization-role-internal.component';

describe('OrganizationRoleInternalComponent', () => {
  let component: OrganizationRoleInternalComponent;
  let fixture: ComponentFixture<OrganizationRoleInternalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationRoleInternalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationRoleInternalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
