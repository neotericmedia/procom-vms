import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollFederaltaxDetailsComponent } from './payroll-federaltax-details.component';

describe('PayrollFederaltaxDetailsComponent', () => {
  let component: PayrollFederaltaxDetailsComponent;
  let fixture: ComponentFixture<PayrollFederaltaxDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayrollFederaltaxDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrollFederaltaxDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
