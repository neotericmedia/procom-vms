import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationRolePaymentMethodsComponent } from './organization-role-payment-methods.component';

describe('OrganizationRolePaymentMethodsComponent', () => {
  let component: OrganizationRolePaymentMethodsComponent;
  let fixture: ComponentFixture<OrganizationRolePaymentMethodsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationRolePaymentMethodsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationRolePaymentMethodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
