 import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionSearchComponent } from './transaction-search.component';

describe('ExpenseSearchComponent', () => {
  let component: TransactionSearchComponent;
  let fixture: ComponentFixture<TransactionSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});