import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseCategoryIconComponent } from './expense-category-icon.component';

describe('ExpenseCategoryIconComponent', () => {
  let component: ExpenseCategoryIconComponent;
  let fixture: ComponentFixture<ExpenseCategoryIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenseCategoryIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseCategoryIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
