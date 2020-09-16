import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VmsTransactionConflictSearchComponent } from './vms-transaction-conflict-search.component';

describe('VmsTransactionConflictSearchComponent', () => {
  let component: VmsTransactionConflictSearchComponent;
  let fixture: ComponentFixture<VmsTransactionConflictSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VmsTransactionConflictSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VmsTransactionConflictSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
