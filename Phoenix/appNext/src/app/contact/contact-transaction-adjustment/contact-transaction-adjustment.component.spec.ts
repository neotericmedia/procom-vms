import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactTransactionAdjustmentComponent } from './contact-transaction-adjustment.component';

describe('ContactTransactionAdjustmentComponent', () => {
  let component: ContactTransactionAdjustmentComponent;
  let fixture: ComponentFixture<ContactTransactionAdjustmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactTransactionAdjustmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactTransactionAdjustmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
