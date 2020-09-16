import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VmsTransactionUnitedStatesSourceDeductionConflictSearchComponent } from './vms-transaction-ussourcededuction-conflict-search.component';

describe('VmsTransactionUnitedStatesSourceDeductionConflictSearchComponent', () => {
  let component: VmsTransactionUnitedStatesSourceDeductionConflictSearchComponent;
  let fixture: ComponentFixture<VmsTransactionUnitedStatesSourceDeductionConflictSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VmsTransactionUnitedStatesSourceDeductionConflictSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VmsTransactionUnitedStatesSourceDeductionConflictSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
