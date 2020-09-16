import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactProfileWorkerEligibilityComponent } from './contact-profile-worker-eligibility.component';

describe('ContactProfileWorkerEligibilityComponent', () => {
  let component: ContactProfileWorkerEligibilityComponent;
  let fixture: ComponentFixture<ContactProfileWorkerEligibilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactProfileWorkerEligibilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactProfileWorkerEligibilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
