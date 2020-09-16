import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VmsDocumentsBatchCommissionComponent } from './vms-documents-batch-commission.component';

describe('VmsDocumentsBatchCommissionComponent', () => {
  let component: VmsDocumentsBatchCommissionComponent;
  let fixture: ComponentFixture<VmsDocumentsBatchCommissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VmsDocumentsBatchCommissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VmsDocumentsBatchCommissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
