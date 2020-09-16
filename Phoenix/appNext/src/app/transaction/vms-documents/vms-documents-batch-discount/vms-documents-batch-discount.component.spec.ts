import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VmsDocumentsBatchDiscountComponent } from './vms-documents-batch-discount.component';

describe('VmsDocumentsBatchDiscountComponent', () => {
  let component: VmsDocumentsBatchDiscountComponent;
  let fixture: ComponentFixture<VmsDocumentsBatchDiscountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VmsDocumentsBatchDiscountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VmsDocumentsBatchDiscountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
