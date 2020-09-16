import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollProvincialTaxComponent } from './payroll-provincial-tax.component';

describe('PayrollProvincialTaxComponent', () => {
  let component: PayrollProvincialTaxComponent;
  let fixture: ComponentFixture<PayrollProvincialTaxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayrollProvincialTaxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrollProvincialTaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
