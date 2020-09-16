import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationRoleInternalOrgImagesComponent } from './organization-role-internal-org-images.component';

describe('OrganizationRoleInternalOrgImagesComponent', () => {
  let component: OrganizationRoleInternalOrgImagesComponent;
  let fixture: ComponentFixture<OrganizationRoleInternalOrgImagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationRoleInternalOrgImagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationRoleInternalOrgImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
