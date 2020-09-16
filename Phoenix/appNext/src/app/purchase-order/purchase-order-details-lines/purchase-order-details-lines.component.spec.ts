import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderDetailsLinesComponent } from './purchase-order-details-lines.component';

describe('PurchaseOrderDetailsLinesComponent', () => {
  let component: PurchaseOrderDetailsLinesComponent;
  let fixture: ComponentFixture<PurchaseOrderDetailsLinesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseOrderDetailsLinesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseOrderDetailsLinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
