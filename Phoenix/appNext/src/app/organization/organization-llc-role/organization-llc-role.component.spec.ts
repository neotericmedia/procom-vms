import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationLlcRoleComponent } from './organization-llc-role.component';

describe('OrganizationLlcRoleComponent', () => {
  let component: OrganizationLlcRoleComponent;
  let fixture: ComponentFixture<OrganizationLlcRoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationLlcRoleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationLlcRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
