import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactProfileBenefitSetupComponent } from './contact-profile-benefit-setup.component';

describe('ContactProfileBenefitSetupComponent', () => {
  let component: ContactProfileBenefitSetupComponent;
  let fixture: ComponentFixture<ContactProfileBenefitSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactProfileBenefitSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactProfileBenefitSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
