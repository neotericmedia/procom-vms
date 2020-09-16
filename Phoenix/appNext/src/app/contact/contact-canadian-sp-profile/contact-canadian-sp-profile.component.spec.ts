import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactCanadianSpProfileComponent } from './contact-canadian-sp-profile.component';

describe('ContactCanadianSpProfileComponent', () => {
  let component: ContactCanadianSpProfileComponent;
  let fixture: ComponentFixture<ContactCanadianSpProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactCanadianSpProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactCanadianSpProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
