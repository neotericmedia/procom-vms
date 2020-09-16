import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactSubscriptionsComponent } from './contact-subscriptions.component';

describe('ContactSearchComponent', () => {
  let component: ContactSubscriptionsComponent;
  let fixture: ComponentFixture<ContactSubscriptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactSubscriptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactSubscriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
