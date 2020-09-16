import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactCanadianIncProfileComponent } from './contact-canadian-inc-profile.component';

describe('ContactCanadianIncProfileComponent', () => {
  let component: ContactCanadianIncProfileComponent;
  let fixture: ComponentFixture<ContactCanadianIncProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactCanadianIncProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactCanadianIncProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
