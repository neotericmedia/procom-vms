import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationSalesTaxesComponent } from './organization-sales-taxes.component';

describe('OrganizationSalesTaxesComponent', () => {
  let component: OrganizationSalesTaxesComponent;
  let fixture: ComponentFixture<OrganizationSalesTaxesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationSalesTaxesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationSalesTaxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
