import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderTabDocumentsComponent } from './purchase-order-tab-documents.component';

describe('PurchaseOrderTabDocumentsComponent', () => {
  let component: PurchaseOrderTabDocumentsComponent;
  let fixture: ComponentFixture<PurchaseOrderTabDocumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseOrderTabDocumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseOrderTabDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
