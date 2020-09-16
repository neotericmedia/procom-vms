/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { VmsTransactionFixedPriceConflictSearchComponent } from './vms-transaction-fixedprice-conflict-search.component';

describe('VmsTransactionFixedPriceConflictSearchComponent', () => {
  let component: VmsTransactionFixedPriceConflictSearchComponent;
  let fixture: ComponentFixture<VmsTransactionFixedPriceConflictSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VmsTransactionFixedPriceConflictSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VmsTransactionFixedPriceConflictSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
