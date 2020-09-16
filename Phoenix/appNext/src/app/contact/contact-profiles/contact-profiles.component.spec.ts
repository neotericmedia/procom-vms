import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactProfilesComponent } from './contact-profiles.component';

describe('ContactProfilesComponent', () => {
  let component: ContactProfilesComponent;
  let fixture: ComponentFixture<ContactProfilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactProfilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
