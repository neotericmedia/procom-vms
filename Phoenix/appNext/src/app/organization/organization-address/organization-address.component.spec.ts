import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationAddressComponent } from './organization-address.component';

describe('OrganizationAddressComponent', () => {
  let component: OrganizationAddressComponent;
  let fixture: ComponentFixture<OrganizationAddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationAddressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
