import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactUserroleComponent } from './contact-userrole.component';

describe('ContactUserroleComponent', () => {
  let component: ContactUserroleComponent;
  let fixture: ComponentFixture<ContactUserroleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactUserroleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactUserroleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
