import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseExceptionsSearchComponent } from './expense-exceptions-search.component';

describe('ExpenseExceptionsSearchComponent', () => {
  let component: ExpenseExceptionsSearchComponent;
  let fixture: ComponentFixture<ExpenseExceptionsSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenseExceptionsSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseExceptionsSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
