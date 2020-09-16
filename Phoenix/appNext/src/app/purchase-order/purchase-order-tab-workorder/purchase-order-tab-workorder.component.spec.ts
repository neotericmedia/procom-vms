import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderTabWorkorderComponent } from './purchase-order-tab-workorder.component';

describe('PurchaseOrderTabWorkorderComponent', () => {
  let component: PurchaseOrderTabWorkorderComponent;
  let fixture: ComponentFixture<PurchaseOrderTabWorkorderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseOrderTabWorkorderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseOrderTabWorkorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
