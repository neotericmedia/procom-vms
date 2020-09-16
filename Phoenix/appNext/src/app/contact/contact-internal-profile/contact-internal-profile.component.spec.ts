import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactInternalProfileComponent } from './contact-internal-profile.component';

describe('ContactInternalProfileComponent', () => {
  let component: ContactInternalProfileComponent;
  let fixture: ComponentFixture<ContactInternalProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactInternalProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactInternalProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
