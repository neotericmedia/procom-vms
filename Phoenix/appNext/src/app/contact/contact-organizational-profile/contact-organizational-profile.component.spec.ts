import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactOrganizationalProfileComponent } from './contact-organizational-profile.component';

describe('ContactOrganizationalProfileComponent', () => {
  let component: ContactOrganizationalProfileComponent;
  let fixture: ComponentFixture<ContactOrganizationalProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactOrganizationalProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactOrganizationalProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
