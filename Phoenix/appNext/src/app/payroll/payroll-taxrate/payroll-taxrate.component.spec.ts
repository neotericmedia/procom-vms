import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollTaxrateComponent } from './payroll-taxrate.component';

describe('PhxPayrollTaxrateComponent', () => {
  let component: PayrollTaxrateComponent;
  let fixture: ComponentFixture<PayrollTaxrateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayrollTaxrateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrollTaxrateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
