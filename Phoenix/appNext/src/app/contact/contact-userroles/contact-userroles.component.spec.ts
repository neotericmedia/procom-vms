import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactUserrolesComponent } from './contact-userroles.component';

describe('ContactUserrolesComponent', () => {
  let component: ContactUserrolesComponent;
  let fixture: ComponentFixture<ContactUserrolesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactUserrolesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactUserrolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
