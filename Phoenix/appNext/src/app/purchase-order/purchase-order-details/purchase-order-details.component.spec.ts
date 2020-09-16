import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderDetailsComponent } from './purchase-order-details.component';

describe('PurchaseOrderDetailsComponent', () => {
  let component: PurchaseOrderDetailsComponent;
  let fixture: ComponentFixture<PurchaseOrderDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseOrderDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseOrderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
