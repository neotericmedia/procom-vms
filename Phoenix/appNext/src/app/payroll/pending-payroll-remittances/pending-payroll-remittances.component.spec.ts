import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingPayrollRemittancesComponent } from './pending-payroll-remittances.component';

describe('PendingPayrollRemittancesComponent', () => {
  let component: PendingPayrollRemittancesComponent;
  let fixture: ComponentFixture<PendingPayrollRemittancesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingPayrollRemittancesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingPayrollRemittancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
