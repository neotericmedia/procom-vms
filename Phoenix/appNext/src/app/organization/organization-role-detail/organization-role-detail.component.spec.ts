import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationRoleDetailComponent } from './organization-role-detail.component';

describe('OrganizationRoleDetailComponent', () => {
  let component: OrganizationRoleDetailComponent;
  let fixture: ComponentFixture<OrganizationRoleDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationRoleDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationRoleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
