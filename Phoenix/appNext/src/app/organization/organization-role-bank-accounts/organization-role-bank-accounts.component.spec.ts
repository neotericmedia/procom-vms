import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationRoleBankAccountsComponent } from './organization-role-bank-accounts.component';

describe('OrganizationRoleBankAccountsComponent', () => {
  let component: OrganizationRoleBankAccountsComponent;
  let fixture: ComponentFixture<OrganizationRoleBankAccountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationRoleBankAccountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationRoleBankAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
