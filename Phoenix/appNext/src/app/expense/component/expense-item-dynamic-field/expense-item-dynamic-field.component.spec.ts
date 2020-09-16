import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseItemDynamicFieldComponent } from './expense-item-dynamic-field.component';

describe('ExpenseItemDynamicFieldComponent', () => {
  let component: ExpenseItemDynamicFieldComponent;
  let fixture: ComponentFixture<ExpenseItemDynamicFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenseItemDynamicFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseItemDynamicFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
