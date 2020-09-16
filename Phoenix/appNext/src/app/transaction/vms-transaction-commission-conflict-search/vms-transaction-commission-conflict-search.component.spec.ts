/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { VmsTransactionCommissionConflictSearchComponent } from './vms-transaction-commission-conflict-search.component';

describe('VmsTransactionCommissionConflictSearchComponent', () => {
  let component: VmsTransactionCommissionConflictSearchComponent;
  let fixture: ComponentFixture<VmsTransactionCommissionConflictSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VmsTransactionCommissionConflictSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VmsTransactionCommissionConflictSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
