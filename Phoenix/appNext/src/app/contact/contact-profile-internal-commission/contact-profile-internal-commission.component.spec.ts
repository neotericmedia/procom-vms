import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactProfileInternalCommissionComponent } from './contact-profile-internal-commission.component';

describe('ContactProfileInternalCommissionComponent', () => {
  let component: ContactProfileInternalCommissionComponent;
  let fixture: ComponentFixture<ContactProfileInternalCommissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactProfileInternalCommissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactProfileInternalCommissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
