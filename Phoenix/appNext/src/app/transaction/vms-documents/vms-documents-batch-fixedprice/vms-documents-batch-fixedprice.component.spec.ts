import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VmsDocumentsBatchFixedpriceComponent } from './vms-documents-batch-fixedprice.component';

describe('VmsDocumentsBatchFixedpriceComponent', () => {
  let component: VmsDocumentsBatchFixedpriceComponent;
  let fixture: ComponentFixture<VmsDocumentsBatchFixedpriceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VmsDocumentsBatchFixedpriceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VmsDocumentsBatchFixedpriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
