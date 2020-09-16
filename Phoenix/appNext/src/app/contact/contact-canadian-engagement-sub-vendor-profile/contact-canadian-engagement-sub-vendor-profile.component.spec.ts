import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactCanadianEngagementSubVendorProfileComponent } from './contact-canadian-engagement-sub-vendor-profile.component';

describe('ContactCanadianEngagementSubVendorProfileComponent', () => {
  let component: ContactCanadianEngagementSubVendorProfileComponent;
  let fixture: ComponentFixture<ContactCanadianEngagementSubVendorProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactCanadianEngagementSubVendorProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactCanadianEngagementSubVendorProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
