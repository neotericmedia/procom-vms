import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactPayrollSetupComponent } from './contact-payroll-setup.component';

describe('ContactPayrollSetupComponent', () => {
  let component: ContactPayrollSetupComponent;
  let fixture: ComponentFixture<ContactPayrollSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactPayrollSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactPayrollSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
