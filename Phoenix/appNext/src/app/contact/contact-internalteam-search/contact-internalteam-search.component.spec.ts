import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactInternalTeamSearchComponent } from './contact-internalteam-search.component';

describe('ContactSearchComponent', () => {
  let component: ContactInternalTeamSearchComponent;
  let fixture: ComponentFixture<ContactInternalTeamSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactInternalTeamSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactInternalTeamSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
