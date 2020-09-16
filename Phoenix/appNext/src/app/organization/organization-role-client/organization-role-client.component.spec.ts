import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationRoleClientComponent } from './organization-role-client.component';

describe('OrganizationRoleClientComponent', () => {
  let component: OrganizationRoleClientComponent;
  let fixture: ComponentFixture<OrganizationRoleClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationRoleClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationRoleClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
