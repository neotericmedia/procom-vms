/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PurchaseorderlinetoworkorderComponent } from './purchaseorderlinetoworkorder.component';

describe('PurchaseorderlinetoworkorderComponent', () => {
  let component: PurchaseorderlinetoworkorderComponent;
  let fixture: ComponentFixture<PurchaseorderlinetoworkorderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseorderlinetoworkorderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseorderlinetoworkorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
