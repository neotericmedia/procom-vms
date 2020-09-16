import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionTabHistoryComponent } from './subscription-tab-history.component';

describe('SubscriptionTabHistoryComponent', () => {
  let component: SubscriptionTabHistoryComponent;
  let fixture: ComponentFixture<SubscriptionTabHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscriptionTabHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionTabHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
