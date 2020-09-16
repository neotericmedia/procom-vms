import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseItemListComponent } from './expense-item-list.component';

describe('ExpenseItemListComponent', () => {
  let component: ExpenseItemListComponent;
  let fixture: ComponentFixture<ExpenseItemListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenseItemListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseItemListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
