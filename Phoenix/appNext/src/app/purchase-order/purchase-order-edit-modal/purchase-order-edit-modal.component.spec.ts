import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderEditModalComponent } from './purchase-order-edit-modal.component';

describe('PurchaseOrderEditModalComponent', () => {
  let component: PurchaseOrderEditModalComponent;
  let fixture: ComponentFixture<PurchaseOrderEditModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseOrderEditModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseOrderEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
