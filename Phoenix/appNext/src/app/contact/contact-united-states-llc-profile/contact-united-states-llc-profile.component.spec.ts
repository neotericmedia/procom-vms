import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactUnitedStatesLlcProfileComponent } from './contact-united-states-llc-profile.component';

describe('ContactUnitedStatesLlcProfileComponent', () => {
  let component: ContactUnitedStatesLlcProfileComponent;
  let fixture: ComponentFixture<ContactUnitedStatesLlcProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactUnitedStatesLlcProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactUnitedStatesLlcProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
