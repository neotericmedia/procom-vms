import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollTaxesSearchComponent } from './payroll-taxes-search.component';

describe('PayrollTaxesSearchComponent', () => {
  let component: PayrollTaxesSearchComponent;
  let fixture: ComponentFixture<PayrollTaxesSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayrollTaxesSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrollTaxesSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
