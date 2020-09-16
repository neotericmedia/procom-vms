import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderTabHistoryComponent } from './purchase-order-tab-history.component';

describe('PurchaseOrderTabHistoryComponent', () => {
  let component: PurchaseOrderTabHistoryComponent;
  let fixture: ComponentFixture<PurchaseOrderTabHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseOrderTabHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseOrderTabHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
