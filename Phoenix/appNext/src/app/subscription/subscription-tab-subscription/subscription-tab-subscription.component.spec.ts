import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionTabSubscriptionComponent } from './subscription-tab-subscription.component';

describe('SubscriptionTabSubscriptionComponent', () => {
  let component: SubscriptionTabSubscriptionComponent;
  let fixture: ComponentFixture<SubscriptionTabSubscriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscriptionTabSubscriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionTabSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
