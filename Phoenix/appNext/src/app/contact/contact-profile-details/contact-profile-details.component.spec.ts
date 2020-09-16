import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactProfileDetailsComponent } from './contact-profile-details.component';

describe('ContactProfileDetailsComponent', () => {
  let component: ContactProfileDetailsComponent;
  let fixture: ComponentFixture<ContactProfileDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactProfileDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactProfileDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
