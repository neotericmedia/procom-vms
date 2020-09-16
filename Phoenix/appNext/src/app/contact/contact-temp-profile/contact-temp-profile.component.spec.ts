import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactTempProfileComponent } from './contact-temp-profile.component';

describe('ContactTempProfileComponent', () => {
  let component: ContactTempProfileComponent;
  let fixture: ComponentFixture<ContactTempProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactTempProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactTempProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
