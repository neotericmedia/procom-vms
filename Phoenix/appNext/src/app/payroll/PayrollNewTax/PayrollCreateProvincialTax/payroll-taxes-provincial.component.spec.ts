import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollTaxesProvincialComponent } from './payroll-taxes-provincial.component';

describe('PayrollTaxesProvincialComponent', () => {
  let component: PayrollTaxesProvincialComponent;
  let fixture: ComponentFixture<PayrollTaxesProvincialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayrollTaxesProvincialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrollTaxesProvincialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
