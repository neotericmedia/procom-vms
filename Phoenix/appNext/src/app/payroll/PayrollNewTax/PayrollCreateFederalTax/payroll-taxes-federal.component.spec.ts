import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollTaxesFederalComponent } from './payroll-taxes-federal.component';

describe('PayrollTaxesFederalComponent', () => {
  let component: PayrollTaxesFederalComponent;
  let fixture: ComponentFixture<PayrollTaxesFederalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayrollTaxesFederalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrollTaxesFederalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
