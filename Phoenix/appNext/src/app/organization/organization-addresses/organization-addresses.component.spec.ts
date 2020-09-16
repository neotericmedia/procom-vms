import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationAddressesComponent } from './organization-addresses.component';

describe('OrganizationAddressesComponent', () => {
  let component: OrganizationAddressesComponent;
  let fixture: ComponentFixture<OrganizationAddressesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationAddressesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationAddressesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
