import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactUnitedStatesW2ProfileComponent } from './contact-united-states-w2-profile.component';

describe('ContactUnitedStatesW2ProfileComponent', () => {
  let component: ContactUnitedStatesW2ProfileComponent;
  let fixture: ComponentFixture<ContactUnitedStatesW2ProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactUnitedStatesW2ProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactUnitedStatesW2ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
