import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationRoleBankAccountComponent } from './organization-role-bank-account.component';

describe('OrganizationRoleBankAccountComponent', () => {
  let component: OrganizationRoleBankAccountComponent;
  let fixture: ComponentFixture<OrganizationRoleBankAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationRoleBankAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationRoleBankAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
