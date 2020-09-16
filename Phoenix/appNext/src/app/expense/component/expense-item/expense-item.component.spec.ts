import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseItemComponent } from './expense-item.component';

describe('ExpenseItemComponent', () => {
  let component: ExpenseItemComponent;
  let fixture: ComponentFixture<ExpenseItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenseItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
