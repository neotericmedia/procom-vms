import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseItemAttachmentsComponent } from './expense-item-attachments.component';

describe('ExpenseItemAttachmentsComponent', () => {
  let component: ExpenseItemAttachmentsComponent;
  let fixture: ComponentFixture<ExpenseItemAttachmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenseItemAttachmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseItemAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
