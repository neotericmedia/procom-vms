import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationTabRolesComponent } from './organization-tab-roles.component';

describe('OrganizationTabRolesComponent', () => {
  let component: OrganizationTabRolesComponent;
  let fixture: ComponentFixture<OrganizationTabRolesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationTabRolesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationTabRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
