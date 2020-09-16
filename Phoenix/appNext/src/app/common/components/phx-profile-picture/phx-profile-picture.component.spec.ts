import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhxProfilePictureComponent } from './phx-profile-picture.component';

describe('PhxProfilePictureComponent', () => {
  let component: PhxProfilePictureComponent;
  let fixture: ComponentFixture<PhxProfilePictureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhxProfilePictureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhxProfilePictureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
