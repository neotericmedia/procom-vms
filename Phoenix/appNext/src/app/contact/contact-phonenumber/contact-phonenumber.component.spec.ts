import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactPhonenumberComponent } from './contact-phonenumber.component';

describe('ContactPhonenumberComponent', () => {
  let component: ContactPhonenumberComponent;
  let fixture: ComponentFixture<ContactPhonenumberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactPhonenumberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactPhonenumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
