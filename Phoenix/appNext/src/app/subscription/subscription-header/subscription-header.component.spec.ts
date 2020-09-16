import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionHeaderComponent } from './subscription-header.component';

describe('SubscriptionHeaderComponent', () => {
  let component: SubscriptionHeaderComponent;
  let fixture: ComponentFixture<SubscriptionHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscriptionHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
