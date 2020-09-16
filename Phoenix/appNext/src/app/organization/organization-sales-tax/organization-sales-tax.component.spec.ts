import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationSalesTaxComponent } from './organization-sales-tax.component';

describe('OrganizationSalesTaxComponent', () => {
  let component: OrganizationSalesTaxComponent;
  let fixture: ComponentFixture<OrganizationSalesTaxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationSalesTaxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationSalesTaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
