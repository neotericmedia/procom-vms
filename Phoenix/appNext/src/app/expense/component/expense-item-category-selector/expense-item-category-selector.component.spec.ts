import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseItemCategorySelectorComponent } from './expense-item-category-selector.component';

describe('ExpenseItemCategorySelectorComponent', () => {
  let component: ExpenseItemCategorySelectorComponent;
  let fixture: ComponentFixture<ExpenseItemCategorySelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenseItemCategorySelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseItemCategorySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
