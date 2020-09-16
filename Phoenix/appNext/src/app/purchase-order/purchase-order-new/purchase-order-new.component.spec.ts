import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderNewComponent } from './purchase-order-new.component';

describe('PurchaseOrderNewComponent', () => {
  let component: PurchaseOrderNewComponent;
  let fixture: ComponentFixture<PurchaseOrderNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseOrderNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseOrderNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
