import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactPhonenumbersComponent } from './contact-phonenumbers.component';

describe('ContactPhonenumbersComponent', () => {
  let component: ContactPhonenumbersComponent;
  let fixture: ComponentFixture<ContactPhonenumbersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactPhonenumbersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactPhonenumbersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
