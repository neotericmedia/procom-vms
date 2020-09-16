import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseItemDetailComponent } from './expense-item-detail.component';

describe('ExpenseItemDetailComponent', () => {
  let component: ExpenseItemDetailComponent;
  let fixture: ComponentFixture<ExpenseItemDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenseItemDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseItemDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
