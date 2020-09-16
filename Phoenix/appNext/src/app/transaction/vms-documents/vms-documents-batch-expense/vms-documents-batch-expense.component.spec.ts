import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VmsDocumentsBatchExpenseComponent } from './vms-documents-batch-expense.component';

describe('VmsDocumentsBatchExpenseComponent', () => {
  let component: VmsDocumentsBatchExpenseComponent;
  let fixture: ComponentFixture<VmsDocumentsBatchExpenseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VmsDocumentsBatchExpenseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VmsDocumentsBatchExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
